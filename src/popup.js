const manifest = chrome.runtime.getManifest();
function detectInitialUiLanguage() {
  let locale = "";
  try { locale = String(chrome.i18n?.getUILanguage?.() || navigator.language || ""); } catch (_) {}
  const primary = locale.trim().replaceAll("_", "-").split("-")[0].toLowerCase();
  return ["ca", "es", "en", "fr"].includes(primary) ? primary : "en";
}
const defaults = { enabled: true, language: "ca-ES", uiLanguage: detectInitialUiLanguage(), theme: "system", showReviewButton: true, excludedSites: [], disabledEditorGroups: [] };
const privateDiagnosticKeys = new Set([
  "text", "textcontent", "rawtext", "sample", "checkedtexttail", "first300wordschecked", "textsample", "textsamples",
  "line", "value", "selection", "selectiontext", "selectionbefore", "selectionafter", "oldfragment", "newfragment",
  "excerpt", "issuetext", "suggestion", "html", "href", "url", "title", "aria", "arialabel", "classname", "dataRi",
  "domattributes", "visibletextsignature", "lastcheckedvisibletextsignature", "activeelement", "elementatlastissue", "el",
  "body", "expected", "actual", "current", "before", "after", "expectedtext", "actualtext", "selectedtext", "linesample",
  "windowtext", "paragraphcontext", "documentparagraphcontext", "anchorbefore", "anchorafter", "sourcetext", "viewporttextsignature",
  "firstmarksviewportsignature", "requestedsignature", "requestedviewportsignature", "lastcheckedsignature", "lastcheckedgeometrysignature",
  "currentvisibletextsignature", "lastcheckedvisibletextsignature", "currentvisiblesignature", "textsignature", "geometrysignature"
].map(key => key.toLowerCase()));
const DICTIONARY_PROFILES = ["ca-ES", "ca-ES-valencia", "ca-ES-balear", "es-ES", "en-US", "fr-FR"];
const FRENCH_PROFILES = ["fr-FR", "fr-CA", "fr-CH", "fr-BE"];
const PROOFING_PROFILES = [...new Set([...DICTIONARY_PROFILES, ...FRENCH_PROFILES])];
let dictionary = Object.fromEntries(DICTIONARY_PROFILES.map(profile => [profile, []]));
let selectedDictionaryProfile = "ca-ES";
let currentHost = "";
let currentHref = "";
let conditionalSiteNoticeKey = "";
let activeTabId = null;
let latestDiagnostic = "";
let enabledWriteQueue = Promise.resolve();
let uiLanguage = "ca";
let uiText = globalThis.CorrectorLocalUiLocales?.ca || {};
let engineErrorTestMode = false;
let installedPackIds = new Set();
let enabledLanguageProfiles = {};
function packIdForProfile(profile) {
  const value = String(profile || "");
  const declared = (globalThis.LletriumPackDescriptors || []).find(pack => pack.profiles?.includes(value));
  return declared?.id || (value.startsWith("ca-") ? "ca" : value === "es-ES" ? "es" : value === "en-US" ? "en" : value.startsWith("fr-") ? "fr" : "");
}
function syncFrenchProfileOptions() {
  const select = document.getElementById("language");
  if (!select) return;
  const previous = select.value;
  const groups = [
    {id:"ca", profiles:["ca-ES","ca-ES-valencia","ca-ES-balear"], labels:["central","valencian","balearic"], general:"catalan"},
    {id:"fr", profiles:FRENCH_PROFILES, labels:["frenchFrance","frenchCanada","frenchSwitzerland","frenchBelgium"], general:"french"}
  ];
  for (const group of groups) {
    for (const option of [...select.options].filter(item => group.profiles.includes(item.value))) option.remove();
    const installed = installedPackIds.has(group.id);
    const selected = enabledLanguageProfiles[group.id];
    const preferred = group.profiles.filter(profile => !Array.isArray(selected) || selected.includes(profile));
    const profiles = installed ? (preferred.length ? preferred : group.profiles) : [group.profiles[0]];
    for (const profile of profiles) {
      const option = document.createElement("option");
      option.value = profile;
      option.dataset.i18n = installed ? group.labels[group.profiles.indexOf(profile)] : group.general;
      option.textContent = !installed && group.id === "ca" ? ({ca:"Català",es:"Catalán",en:"Catalan",fr:"Catalan"}[uiLanguage] || "Català") : tr(option.dataset.i18n);
      select.append(option);
    }
  }
  if ([...select.options].some(option => option.value === previous)) select.value = previous;
}
function syncComingSoonOptions() {
  const select=document.getElementById("language");
  if (!select) return;
  for (const language of globalThis.CorrectorLocalUiLocales.plannedLanguages) {
    let option=[...select.options].find(option=>option.value===language.profile);
    if (!option) { option=document.createElement("option");option.value=language.profile;select.append(option); }
    delete option.dataset.i18n;
    option.dataset.comingSoon="true";
    option.dataset.baseLabel=language.labels[uiLanguage]||language.labels.en;
    option.textContent=option.dataset.baseLabel+" — "+globalThis.CorrectorLocalUiLocales.comingSoonLabels[uiLanguage];
    option.disabled=true;
  }
}
function refreshPackAvailability() {
  syncComingSoonOptions();
  const proofing = document.getElementById("language");
  const dictionarySelect = document.getElementById("dictionaryLanguage");
  for (const select of [proofing, dictionarySelect]) for (const option of select?.options || []) if (option.dataset.comingSoon !== "true") {
    const baseLabel = select === proofing && option.value === "ca-ES" && !installedPackIds.has("ca") ? ({ca:"Català",es:"Catalán",en:"Catalan",fr:"Catalan"}[uiLanguage] || "Català") : option.dataset.i18n ? tr(option.dataset.i18n) : (option.dataset.baseLabel || option.textContent.replace(/\s+[—–-]\s+(?:No instal·lat|No instalado|Not installed)$/i, ""));
    option.dataset.baseLabel = baseLabel;
    const missing = !installedPackIds.has(packIdForProfile(option.value));
    option.disabled = missing;
    option.textContent = missing ? `${baseLabel} — ${tr("notInstalled")}` : baseLabel;
  }
}
function openLanguageSetup() { return chrome.runtime.sendMessage({ type: "CL_OPEN_LANGUAGE_MANAGER" }); }
function getProofingLanguage() {
  const selected = document.getElementById("language")?.value || "ca-ES";
  return PROOFING_PROFILES.includes(selected) ? selected : "ca-ES";
}
function dictionaryProfileForProofing(profile = getProofingLanguage()) { return profile.startsWith("ca-") ? "ca-ES" : profile.startsWith("fr-") ? "fr-FR" : profile; }
function dictionaryLocale(profile = getProofingLanguage()) { return profile === "es-ES" ? "es" : profile === "en-US" ? "en-US" : profile.startsWith("fr-") ? "fr" : "ca"; }
function profileLabel(profile = getProofingLanguage()) {
  const labels = { "ca-ES": "central", "ca-ES-valencia": "valencian", "ca-ES-balear": "balearic", "es-ES": "spanish", "en-US": "english", "fr-FR": "frenchFrance", "fr-CA": "frenchCanada", "fr-CH": "frenchSwitzerland", "fr-BE": "frenchBelgium" };
  return tr(labels[profile] || "central");
}
function dictionaryProfileLabel(profile = selectedDictionaryProfile) {
  return profile === "ca-ES" ? tr("catalan") : profile === "fr-FR" ? tr("french") : profileLabel(profile);
}
function alphabetizedOptions(select) {
  const rank = option => {
    if (option.dataset.comingSoon === "true") return 2;
    return option.disabled ? 1 : 0;
  };
  const label = option => option.dataset.baseLabel || option.textContent.replace(/\s+[—–-]\s+(?:No instal·lat|No instalado|Not installed)$/i, "");
  return [...select.options].sort((a, b) => rank(a) - rank(b)
    || label(a).localeCompare(label(b), uiLanguage, { sensitivity: "base", numeric: true }));
}
function countryFlagMarkup(profile) {
  return globalThis.CorrectorLocalUiLocales.profileFlagMarkup(profile);
}
function renderLanguagePicker() {
  const profile = getProofingLanguage();
  const badge = document.getElementById("languageBadge");
  const label = document.getElementById("languagePickerLabel");
  const options = document.getElementById("languageOptions");
  if (!badge || !label || !options) return;
  const languageSelect = document.getElementById("language");
  const selectedOption = [...languageSelect.options].find(option => option.value === profile);
  label.textContent = selectedOption?.textContent || profileLabel(profile);
  badge.innerHTML = countryFlagMarkup(profile);
  const entries = alphabetizedOptions(languageSelect).map(option => {
    const item = document.createElement("div");
    item.className = "language-option";
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", String(option.value === profile));
    item.setAttribute("aria-disabled", String(option.disabled));
    item.tabIndex = -1;
    item.dataset.value = option.value;
    item.innerHTML = `<span class="language-badge" aria-hidden="true">${countryFlagMarkup(option.value)}</span><span>${option.textContent}</span>`;
    return item;
  });
  options.replaceChildren(...entries);
}
function renderInterfaceLanguagePicker() {
  const select = document.getElementById("uiLanguage");
  const label = document.getElementById("uiLanguagePickerLabel");
  const options = document.getElementById("uiLanguageOptions");
  if (!select || !label || !options) return;
  const nativeNames = { ca: "Català", es: "Español", en: "English", fr: "Français" };
  label.textContent = nativeNames[select.value] || "English";
  options.replaceChildren(...[...select.options].map(option => {
    const item = document.createElement("div");
    item.className = "language-option";
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", String(option.value === select.value));
    item.tabIndex = -1;
    item.dataset.value = option.value;
    item.textContent = nativeNames[option.value] || option.textContent;
    return item;
  }));
}
function renderDictionaryLanguagePicker() {
  const select = document.getElementById("dictionaryLanguage");
  const badge = document.getElementById("dictionaryLanguageBadge");
  const label = document.getElementById("dictionaryLanguagePickerLabel");
  const options = document.getElementById("dictionaryLanguageOptions");
  if (!select || !badge || !label || !options) return;
  const profile = dictionaryProfileForProofing(DICTIONARY_PROFILES.includes(selectedDictionaryProfile) ? selectedDictionaryProfile : getProofingLanguage());
  select.value = profile;
  badge.innerHTML = countryFlagMarkup(profile);
  label.textContent = select.selectedOptions[0]?.textContent || profileLabel(profile);
  options.replaceChildren(...alphabetizedOptions(select).map(option => {
    const item = document.createElement("div");
    item.className = "language-option";
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", String(option.value === profile));
    item.setAttribute("aria-disabled", String(option.disabled));
    item.tabIndex = -1;
    item.dataset.value = option.value;
    item.innerHTML = `<span class="language-badge" aria-hidden="true">${countryFlagMarkup(option.value)}</span><span>${option.textContent}</span>`;
    return item;
  }));
}
function wireSelectPicker(selectId, buttonId, optionsId) {
  const select = document.getElementById(selectId);
  const button = document.getElementById(buttonId);
  const options = document.getElementById(optionsId);
  const picker = button.closest(".language-select");
  const close = (returnFocus = false) => {
    options.hidden = true;
    button.setAttribute("aria-expanded", "false");
    if (returnFocus) button.focus({ preventScroll: true });
  };
  const open = () => {
    options.hidden = false;
    button.setAttribute("aria-expanded", "true");
    options.querySelector('[aria-selected="true"]')?.focus({ preventScroll: true });
  };
  const choose = value => {
    const option = [...select.options].find(entry => entry.value === value);
    if (!option) return;
    if (option.disabled) {
      if (select.id === "language" && PROOFING_PROFILES.includes(value) && !installedPackIds.has(packIdForProfile(value))) {
        close();
        openLanguageSetup();
      }
      return;
    }
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    close(true);
  };
  button.addEventListener("click", () => options.hidden ? open() : close());
  button.addEventListener("keydown", event => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      open();
    }
  });
  options.addEventListener("click", event => {
    const option = event.target.closest('[role="option"]');
    if (option) choose(option.dataset.value);
  });
  options.addEventListener("keydown", event => {
    const items = [...options.querySelectorAll('[role="option"]:not([aria-disabled="true"])')];
    let index = items.indexOf(document.activeElement);
    if (event.key === "Escape") { event.preventDefault(); close(true); return; }
    if (event.key === "Tab") { close(); return; }
    if (event.key === "ArrowDown") index = Math.min(items.length - 1, index + 1);
    else if (event.key === "ArrowUp") index = Math.max(0, index - 1);
    else if (event.key === "Home") index = 0;
    else if (event.key === "End") index = items.length - 1;
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(document.activeElement?.dataset.value); return; }
    else return;
    event.preventDefault();
    items[index]?.focus({ preventScroll: true });
  });
  document.addEventListener("pointerdown", event => { if (!picker.contains(event.target)) close(); });
}
function renderEnabledState() {
  const control = document.getElementById("enabled");
  const label = tr(control.checked ? "enabled" : "disabled");
  document.querySelector(".toggle-label").textContent = label;
  control.setAttribute("aria-label", label);
  control.closest(".toggle-row").setAttribute("aria-label", label);
}

function tr(key, values = {}) {
  let value = uiText[key] || globalThis.CorrectorLocalUiLocales?.ca?.[key] || key;
  for (const [name, replacement] of Object.entries(values)) value = value.replaceAll(`{${name}}`, String(replacement));
  return value;
}
function applyPopupLocale(language = "ca") {
  uiLanguage = ["ca", "es", "en", "fr"].includes(language) ? language : "ca";
  uiText = globalThis.CorrectorLocalUiLocales?.[uiLanguage] || globalThis.CorrectorLocalUiLocales?.ca || {};
  document.documentElement.lang = uiLanguage;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = tr(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => { el.placeholder = tr(el.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", tr(el.dataset.i18nAria)); });
  document.querySelectorAll("[data-i18n-title]").forEach(el => { el.setAttribute("title", tr(el.dataset.i18nTitle)); });
  const interfaceLanguageControl = document.getElementById("uiLanguage");
  if (interfaceLanguageControl) {
    interfaceLanguageControl.setAttribute("aria-label", tr("interfaceLanguage"));
    interfaceLanguageControl.setAttribute("title", tr("interfaceLanguage"));
  }
  document.title = tr("appTitle");
  document.getElementById("versionInfo").textContent = tr("version", { version: chrome.runtime.getManifest().version });
  const settingsVersion = document.getElementById("settingsVersion");
  if (settingsVersion) settingsVersion.textContent = tr("version", { version: chrome.runtime.getManifest().version });
  document.getElementById("currentHost").textContent = currentHost || tr("siteUnavailable");
  refreshPackAvailability();
  renderUnsupportedSiteNotice();
  renderEnabledState();
  renderInterfaceLanguagePicker();
  renderDictionaryLanguagePicker();
  renderSitesFromCurrentSettings();
  renderDictionary();
  renderLanguagePicker();
  refreshEngineStatus();
}
function renderUnsupportedSiteNotice() {
  const notice = document.getElementById("unsupportedSiteNotice");
  if (!notice) return;
  const messageKey = conditionalSiteNoticeKey
    || globalThis.CorrectorLocalSiteSupport?.getUnsupportedMessageKey?.(currentHost, currentHref) || "";
  notice.textContent = messageKey ? tr(messageKey) : "";
  notice.hidden = !messageKey;
}
async function getConditionalSiteNoticeKey(tabId, href) {
  if (!Number.isInteger(tabId) || !/(?:onedrive|officeapps)\.live\.com/i.test(href)) return "";
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => document.querySelector("div#EditorContainer #PagesContainer div.Page > div.PageContent")
        ? "" : "msOnlineOfficeNotSupported"
    });
    return results?.[0]?.result === "msOnlineOfficeNotSupported" ? "msOnlineOfficeNotSupported" : "";
  } catch (_) { return ""; }
}
function applyPopupTheme(theme = "system") {
  const value = ["light", "dark"].includes(theme) ? theme : "system";
  document.documentElement.dataset.theme = value;
  const darkMode = document.getElementById("darkMode");
  if (darkMode) darkMode.checked = value === "dark" || (value === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches === true);
}
function setEngineFailureHelp(visible) {
  const help = document.getElementById("engineFailureHelp");
  if (help) help.hidden = !visible;
}

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
  const [storedSettings, personal, tabs, installedPacks] = await Promise.all([
    chrome.storage.sync.get(null),
    chrome.storage.local.get({ personalDictionary: {}, engineErrorTestMode: false, advancedUnlocked: false }),
    chrome.tabs.query({ active: true, currentWindow: true }).catch(() => []),
    globalThis.LletriumLanguagePacks.listPacks().catch(() => [])
  ]);
  installedPackIds = new Set(installedPacks.filter(pack => globalThis.LletriumLanguagePacks.isPackCompatible(pack)).map(pack => pack.id));
  enabledLanguageProfiles = storedSettings.enabledLanguageProfiles || {};
  syncFrenchProfileOptions();
  const settings = { ...defaults, ...storedSettings };
  if (!["ca", "es", "en", "fr"].includes(settings.uiLanguage)) {
    settings.uiLanguage = defaults.uiLanguage;
    chrome.storage.sync.set({ uiLanguage: settings.uiLanguage }).catch(() => {});
  }
  if (!["light", "dark"].includes(settings.theme)) {
    settings.theme = window.matchMedia?.("(prefers-color-scheme: dark)").matches === true ? "dark" : "light";
    chrome.storage.sync.set({ theme: settings.theme }).catch(() => {});
  }
  const tab = tabs?.[0];
  activeTabId = Number.isInteger(tab?.id) ? tab.id : null;
  try {
    const currentUrl = new URL(tab?.url || "");
    currentHref = currentUrl.href;
    currentHost = ["http:", "https:"].includes(currentUrl.protocol) ? currentUrl.hostname.toLowerCase() : "";
  } catch (_) { currentHost = ""; currentHref = ""; }
  conditionalSiteNoticeKey = await getConditionalSiteNoticeKey(activeTabId, currentHref);
  document.getElementById("enabled").checked = settings.enabled !== false;
  document.getElementById("showReviewButton").checked = settings.showReviewButton !== false;
  document.getElementById("uiLanguage").value = ["ca", "es", "en", "fr"].includes(settings.uiLanguage) ? settings.uiLanguage : "ca";
  applyPopupLocale(document.getElementById("uiLanguage").value);
  applyPopupTheme(settings.theme);
  const languageControl = document.getElementById("language");
  const savedLanguage = settings.language === "ca" ? "ca-ES" : settings.language === "es" ? "es-ES" : settings.language === "en" ? "en-US" : settings.language;
  refreshPackAvailability();
  const availableProfiles = [...languageControl.options].map(option => option.value);
  const validSavedLanguage = availableProfiles.includes(savedLanguage) && installedPackIds.has(packIdForProfile(savedLanguage));
  const fallbackLanguage = availableProfiles.find(profile => installedPackIds.has(packIdForProfile(profile)));
  const missingProfile = savedLanguage.startsWith("ca-") ? "ca-ES" : savedLanguage.startsWith("fr-") ? "fr-FR" : savedLanguage;
  languageControl.value = validSavedLanguage ? savedLanguage : fallbackLanguage || (availableProfiles.includes(missingProfile) ? missingProfile : "ca-ES");
  if (fallbackLanguage && !validSavedLanguage) chrome.storage.sync.set({ language: fallbackLanguage }).catch(() => {});
  selectedDictionaryProfile = dictionaryProfileForProofing(languageControl.value);
  renderLanguagePicker();
  renderDictionaryLanguagePicker();
  if (settings.language !== savedLanguage) chrome.storage.sync.set({ language: savedLanguage });
  engineErrorTestMode = personal.engineErrorTestMode === true;
  document.getElementById("engineErrorTestMode").checked = engineErrorTestMode;
  document.getElementById("advancedSection").hidden = personal.advancedUnlocked !== true;
  dictionary = normalizeDictionary(personal.personalDictionary);
  if (JSON.stringify(personal.personalDictionary || {}) !== JSON.stringify(dictionary)) await saveDictionary();
  document.getElementById("currentHost").textContent = currentHost || tr("siteUnavailable");
  renderUnsupportedSiteNotice();
  renderSites(settings.excludedSites || []);
  renderDictionary();
  const privacyLink = document.getElementById("privacyPolicyLink");
  const privacyUrl = String(globalThis.CorrectorLocalLinks?.privacyPolicyUrl || "").trim();
  if (privacyLink && privacyUrl) {
    privacyLink.href = privacyUrl;
    privacyLink.target = "_blank";
    privacyLink.rel = "noopener noreferrer";
    privacyLink.removeAttribute("aria-disabled");
    privacyLink.removeAttribute("tabindex");
  }
  wireNavigation();
  wireAdvancedUnlock();
  wireSettings();
  wireDictionary();
  const launchState = await chrome.storage.local.get({ openLanguageManager: false });
  if (launchState.openLanguageManager) {
    await chrome.storage.local.set({ openLanguageManager: false });
    openLanguageSetup();
  }
  refreshEngineStatus();
  const timer = setInterval(refreshEngineStatus, 1400);
  window.addEventListener("pagehide", () => clearInterval(timer), { once: true });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.installedLanguagePacksRevision) {
      globalThis.LletriumLanguagePacks.listPacks().then(packs => {
        installedPackIds = new Set(packs.filter(pack => globalThis.LletriumLanguagePacks.isPackCompatible(pack)).map(pack => pack.id));
        syncFrenchProfileOptions();
        const languageControl = document.getElementById("language");
        const activeLanguage = languageControl?.value || "";
        if (languageControl && PROOFING_PROFILES.includes(activeLanguage) && !installedPackIds.has(packIdForProfile(activeLanguage))) {
          const fallback = [...languageControl.options].map(option => option.value).find(profile => installedPackIds.has(packIdForProfile(profile)));
          if (fallback) {
            languageControl.value = fallback;
            chrome.storage.sync.set({ language: fallback }).catch(() => {});
          }
        }
        refreshPackAvailability();
        renderLanguagePicker();
        renderDictionaryLanguagePicker();
        refreshEngineStatus();
      }).catch(() => {});
    }
    if (area === "sync" && changes.enabledLanguageProfiles) {
      enabledLanguageProfiles = changes.enabledLanguageProfiles.newValue || {};
      syncFrenchProfileOptions(); refreshPackAvailability(); renderLanguagePicker();
    }
    if (area === "sync" && changes.excludedSites) renderSites(changes.excludedSites.newValue || []);
    if (area === "sync" && changes.enabled) {
      document.getElementById("enabled").checked = changes.enabled.newValue !== false;
      renderEnabledState();
      refreshEngineStatus();
    }
    if (area === "sync" && changes.uiLanguage) {
      document.getElementById("uiLanguage").value = changes.uiLanguage.newValue || "ca";
      applyPopupLocale(changes.uiLanguage.newValue || "ca");
    }
    if (area === "sync" && changes.theme) {
      applyPopupTheme(changes.theme.newValue || "system");
    }
    if (area === "sync" && changes.language) {
      document.getElementById("language").value = PROOFING_PROFILES.includes(changes.language.newValue) ? changes.language.newValue : "ca-ES";
      renderLanguagePicker();
      renderDictionary();
      refreshEngineStatus();
    }
    if (area === "sync" && changes.showReviewButton) {
      document.getElementById("showReviewButton").checked = changes.showReviewButton.newValue !== false;
    }
    if (area === "local" && changes.personalDictionary) {
      dictionary = normalizeDictionary(changes.personalDictionary.newValue);
      renderDictionary();
    }
    if (area === "local" && changes.engineErrorTestMode) {
      engineErrorTestMode = changes.engineErrorTestMode.newValue === true;
      document.getElementById("engineErrorTestMode").checked = engineErrorTestMode;
      refreshEngineStatus();
    }
  });
}

function wireNavigation() {
  wireSelectPicker("language", "languagePickerButton", "languageOptions");
  wireSelectPicker("uiLanguage", "uiLanguagePickerButton", "uiLanguageOptions");
  wireSelectPicker("dictionaryLanguage", "dictionaryLanguagePickerButton", "dictionaryLanguageOptions");
  document.getElementById("openSettings")?.addEventListener("click", () => showView("settings"));
  document.getElementById("reportIssueButton")?.addEventListener("click", () => {
    const reportUrl = String(globalThis.CorrectorLocalLinks?.reportIssueUrl || "").trim();
    if (reportUrl) {
      chrome.tabs.create({ url: reportUrl });
      return;
    }
    const notice = document.getElementById("reportIssueNotice");
    if (notice) notice.hidden = false;
  });
  for (const button of document.querySelectorAll("[data-open-view]")) {
    button.addEventListener("click", () => showView(button.dataset.openView));
  }
  for (const button of document.querySelectorAll("[data-back]")) button.addEventListener("click", () => showView("home"));
  document.getElementById("manageLanguages")?.addEventListener("click", openLanguageSetup);

}
function wireAdvancedUnlock() {
  let progress = "";
  document.addEventListener("keydown", async event => {
    if (document.getElementById("settingsView")?.hidden || event.altKey || event.ctrlKey || event.metaKey) {
      progress = "";
      return;
    }
    if (event.target?.closest?.("input:not([type='checkbox']):not([type='radio']),textarea,select,[contenteditable='true']")) return;
    if (!/^[1-4]$/.test(event.key)) {
      progress = "";
      return;
    }
    progress = (progress + event.key).slice(-4);
    if (progress !== "1234") return;
    progress = "";
    try {
      await chrome.storage.local.set({ advancedUnlocked: true });
      const section = document.getElementById("advancedSection");
      section.hidden = false;
      section.open = false;
    } catch (_) {}
  }, true);
}
function showView(name) {
  for (const view of document.querySelectorAll("[data-view]")) view.hidden = view.dataset.view !== name;
  if (name === "dictionary") {
    selectedDictionaryProfile = dictionaryProfileForProofing();
    renderDictionaryLanguagePicker();
    renderDictionary();
  }
  const target = name === "dictionary" ? document.getElementById("newWord") : name === "sites" ? document.getElementById("siteAddress") : name === "settings" ? document.getElementById("darkMode") : document.getElementById("enabled");
  if (name === "sites") refreshExcludedSites();
  target?.focus({ preventScroll: true });
}
function wireSettings() {
  document.getElementById("enabled").addEventListener("change", async event => {
    const requestedEnabled = event.currentTarget.checked;
    renderEnabledState();
    enabledWriteQueue = enabledWriteQueue.catch(() => {}).then(() =>
      chrome.storage.sync.set({ enabled: requestedEnabled })
    );
    enabledWriteQueue.catch(async error => {
      const switchControl = document.getElementById("enabled");
      const settings = await chrome.storage.sync.get(defaults).catch(() => defaults);
      if (switchControl.checked === requestedEnabled) {
        switchControl.checked = settings.enabled !== false;
        renderEnabledState();
        const status = document.getElementById("engineStatus");
        status.dataset.state = "error";
        status.title = String(error?.message || error);
        document.getElementById("engineMessage").textContent = tr("settingsSaveFailed");
        setEngineFailureHelp(false);
      }
    });
  });
  document.getElementById("language").addEventListener("change", event => {
    const language = PROOFING_PROFILES.includes(event.currentTarget.value) ? event.currentTarget.value : "ca-ES";
    if (!installedPackIds.has(packIdForProfile(language))) { openLanguageSetup(); return; }
    event.currentTarget.value = language;
    renderLanguagePicker();
    renderDictionary();
    refreshEngineStatus();
    chrome.storage.sync.set({ language }).catch(() => {});
  });
  document.getElementById("uiLanguage").addEventListener("change", event => {
    const value = ["ca", "es", "en", "fr"].includes(event.currentTarget.value) ? event.currentTarget.value : "ca";
    applyPopupLocale(value);
    chrome.storage.sync.set({ uiLanguage: value }).then(() => notifyActiveTabOfUiPreferences()).catch(() => {});
  });
  document.getElementById("darkMode").addEventListener("change", event => {
    const value = event.currentTarget.checked ? "dark" : "light";
    applyPopupTheme(value);
    chrome.storage.sync.set({ theme: value }).then(() => notifyActiveTabOfUiPreferences()).catch(() => {});
  });
  document.getElementById("showReviewButton").addEventListener("change", async event => {
    const control = event.currentTarget;
    const requestedVisible = control.checked;
    try {
      await chrome.storage.sync.set({ showReviewButton: requestedVisible });
    } catch (_) {
      const saved = await chrome.storage.sync.get(defaults).catch(() => defaults);
      control.checked = saved.showReviewButton !== false;
      setNotice("settingsNotice", tr("settingsSaveFailed"));
    }
  });
  document.getElementById("excludeCurrentSite").addEventListener("click", toggleCurrentSite);
  document.getElementById("addExcludedSiteForm").addEventListener("submit", addExcludedSite);
  document.getElementById("showResetConfirm").addEventListener("click", () => {
    document.getElementById("resetConfirm").hidden = false;
    document.getElementById("showResetConfirm").hidden = true;
    document.getElementById("cancelReset").focus();
  });
  document.getElementById("cancelReset").addEventListener("click", () => {
    document.getElementById("resetConfirm").hidden = true;
    document.getElementById("showResetConfirm").hidden = false;
    document.getElementById("showResetConfirm").focus();
  });
  document.getElementById("confirmReset").addEventListener("click", resetToFactoryDefaults);
  document.getElementById("engineErrorTestMode").addEventListener("change", async event => {
    const previous = engineErrorTestMode;
    engineErrorTestMode = event.currentTarget.checked;
    try {
      await chrome.storage.local.set({ engineErrorTestMode });
      refreshEngineStatus();
    } catch (_) {
      engineErrorTestMode = previous;
      event.currentTarget.checked = previous;
    }
  });
  document.getElementById("diagnosticsBtn").addEventListener("click", () => runDiagnostics(false));
  document.getElementById("editorAnalysisBtn").addEventListener("click", runEditorAnalysis);
  const pickEditorButton = document.createElement("button");
  pickEditorButton.type = "button";
  pickEditorButton.textContent = ({ ca: "⌖ Seleccionar text a la pàgina", es: "⌖ Seleccionar texto en la página", en: "⌖ Pick text on the page", fr: "⌖ Sélectionner le texte sur la page" })[uiLanguage] || "⌖ Pick text on the page";
  document.getElementById("editorAnalysisBtn").after(pickEditorButton);
  pickEditorButton.addEventListener("click", async () => {
    try {
      await chrome.storage.local.remove("editorPickedCapture");
      await chrome.scripting.executeScript({ target: { tabId: activeTabId, allFrames: true }, func: installEditorPicker, args: [activeTabId, uiLanguage] });
      window.close();
    } catch (error) {
      document.getElementById("editorAnalysisStatus").textContent = String(error?.message || error);
    }
  });
  document.getElementById("copyEditorAnalysisBtn").addEventListener("click", copyEditorAnalysis);
  document.getElementById("coldStartBtn").addEventListener("click", () => runDiagnostics(true));
  document.getElementById("paintRecordBtn").addEventListener("click", togglePaintRecording);
  document.getElementById("paintRecordingCopyBtn").addEventListener("click", copyPaintRecording);
  document.getElementById("readRecordBtn").addEventListener("click", toggleReadRecording);
  document.getElementById("readRecordingCopyBtn").addEventListener("click", copyReadRecording);
  syncReadRecordingState();
  syncPaintRecordingState();
  document.getElementById("preloadBtn").addEventListener("click", preloadNow);
  document.getElementById("copyDiagnosticsBtn").addEventListener("click", copyDiagnostics);
}
async function syncPaintRecordingState() {
  const button = document.getElementById("paintRecordBtn");
  const status = document.getElementById("paintRecordingStatus");
  try {
    if (!Number.isInteger(activeTabId)) return;
    const result = await chrome.tabs.sendMessage(activeTabId, { type: "CL_GDOCS_PAINT_RECORDING", action: "status" }, { frameId: 0 });
    if (!result?.ok) return;
    button.dataset.recording = result.active ? "true" : "false";
    button.textContent = result.active ? tr("recordingStop") : tr("paintRecordingStart");
    status.textContent = result.active ? tr("paintRecordingActive", { count: result.eventCount }) : tr("paintRecordingStopped");
  } catch { /* Ignore tabs without an active content script. */ }
}
async function togglePaintRecording() {
  const button = document.getElementById("paintRecordBtn");
  const status = document.getElementById("paintRecordingStatus");
  try {
    if (!Number.isInteger(activeTabId)) throw new Error(tr("recordingNeedsDocs"));
    const stopping = button.dataset.recording === "true";
    const result = await chrome.tabs.sendMessage(activeTabId, { type: "CL_GDOCS_PAINT_RECORDING", action: stopping ? "stop" : "start" }, { frameId: 0 });
    if (!result?.ok) throw new Error(result?.error || "No s'ha trobat Google Docs a la pestanya activa.");
    button.dataset.recording = stopping ? "false" : "true";
    button.textContent = stopping ? tr("paintRecordingStart") : tr("recordingStop");
    status.textContent = stopping ? tr("paintRecordingStoppedCount", { count: result.eventCount }) : tr("paintRecordingActive", { count: result.eventCount });
    if (stopping) window.paintRecordingPayload = result.recording;
  } catch (error) { status.textContent = String(error?.message || error); }
}
async function copyPaintRecording() {
  const status = document.getElementById("paintRecordingStatus");
  try {
    if (!Number.isInteger(activeTabId)) throw new Error(tr("recordingNeedsDocs"));
    const result = await chrome.tabs.sendMessage(activeTabId, { type: "CL_GDOCS_PAINT_RECORDING", action: "copy" }, { frameId: 0 });
    if (!result?.ok) throw new Error(result?.error || "No hi ha cap gravació de Google Docs.");
    await navigator.clipboard.writeText(JSON.stringify(result.recording));
    status.textContent = tr("paintRecordingCopied");
  } catch (error) { status.textContent = String(error?.message || error); }
}
async function toggleReadRecording() {
  const b=document.getElementById("readRecordBtn"), s=document.getElementById("readRecordingStatus");
  try { const stop=b.dataset.recording==="true"; const r=await chrome.tabs.sendMessage(activeTabId,{type:"CL_GDOCS_READ_RECORDING",action:stop?"stop":"start"},{frameId:0}); if(!r?.ok) throw Error(r?.error||tr("recordingNeedsDocs")); b.dataset.recording=stop?"false":"true"; b.textContent=stop?tr("readRecordingStart"):tr("recordingStop"); s.textContent=stop?tr("readRecordingStoppedCount",{count:r.eventCount}):tr("readRecordingActive",{count:r.eventCount}); } catch(e){s.textContent=String(e.message||e);}
}
async function syncReadRecordingState() {
  const b=document.getElementById("readRecordBtn"),s=document.getElementById("readRecordingStatus");
  try { if(!Number.isInteger(activeTabId))return; const r=await chrome.tabs.sendMessage(activeTabId,{type:"CL_GDOCS_READ_RECORDING",action:"status"},{frameId:0}); if(!r?.ok)return; b.dataset.recording=r.active?"true":"false"; b.textContent=r.active?tr("recordingStop"):tr("readRecordingStart"); s.textContent=r.active?tr("readRecordingActive",{count:r.eventCount}):tr("readRecordingStopped"); } catch {}
}
async function copyReadRecording() {
  const s=document.getElementById("readRecordingStatus");
  try { const r=await chrome.tabs.sendMessage(activeTabId,{type:"CL_GDOCS_READ_RECORDING",action:"copy"},{frameId:0}); if(!r?.ok) throw Error(r?.error||tr("readRecordingStopped")); await navigator.clipboard.writeText(JSON.stringify(r.recording)); s.textContent=tr("readRecordingCopied"); } catch(e){s.textContent=String(e.message||e);}
}
function notifyActiveTabOfUiPreferences() {
  if (!Number.isInteger(activeTabId)) return;
  const uiLanguage = document.getElementById("uiLanguage")?.value || "ca";
  const theme = document.documentElement.dataset.theme || "system";
  chrome.tabs.sendMessage(activeTabId, { type: "CL_UI_PREFERENCES_CHANGED", uiLanguage, theme }).catch(() => {});
}
function wireDictionary() {
  document.getElementById("dictionaryLanguage").addEventListener("change", event => {
    selectedDictionaryProfile = dictionaryProfileForProofing(DICTIONARY_PROFILES.includes(event.currentTarget.value) ? event.currentTarget.value : getProofingLanguage());
    event.currentTarget.value = selectedDictionaryProfile;
    renderDictionaryLanguagePicker();
    setNotice("dictionaryNotice", "");
    renderDictionary();
  });
  document.getElementById("addWordForm").addEventListener("submit", addWord);
  document.getElementById("wordSearch").addEventListener("input", renderDictionary);
  document.getElementById("exportDictionary").addEventListener("click", exportDictionary);
  document.getElementById("importDictionary").addEventListener("click", () => document.getElementById("importFile").click());
  document.getElementById("importFile").addEventListener("change", importDictionary);
}
async function refreshEngineStatus() {
  const status = document.getElementById("engineStatus");
  const message = document.getElementById("engineMessage");
  try {
    const settings = await chrome.storage.sync.get(defaults);
    if (settings.enabled === false) {
      status.dataset.state = "off";
      status.title = "";
      message.textContent = tr("engineOff");
      setEngineWarning(false);
      setEngineFailureHelp(false);
      return;
    }
    if (engineErrorTestMode) {
      status.dataset.state = "error";
      status.title = tr("engineTestStatus");
      message.textContent = tr("engineError");
      setEngineWarning(true);
      setEngineFailureHelp(false);
      return;
    }
    const response = await chrome.runtime.sendMessage({ type: "CL_ENGINE_READINESS", language: document.getElementById("language").value || "ca-ES" });
    const readiness = response?.readiness || {};
    const phase = String(readiness.phase || "");
    if (phase === "worker-ready-full" && readiness.loaded === true && readiness.workerLoaded === true
      && readiness.worker?.workerAlive === true && Number(readiness.percent) >= 100) {
      status.dataset.state = "ready";
      status.title = "";
      message.textContent = tr("ready");
      setEngineWarning(false);
      setEngineFailureHelp(false);
    } else if (readiness.error || response?.error || response?.ok === false) {
      status.dataset.state = "error"; message.textContent = tr("engineError");
      status.title = String(readiness.error || response.error || tr("engineError"));
      setEngineWarning(true);
      setEngineFailureHelp(true);
    } else {
      status.dataset.state = "loading";
      status.title = "";
      message.textContent = tr("loading");
      setEngineWarning(false);
      setEngineFailureHelp(false);
    }
  } catch (error) {
    status.dataset.state = "error";
    message.textContent = tr("engineQueryError");
    status.title = String(error?.message || error);
    setEngineWarning(true);
    setEngineFailureHelp(true);
  }
}

function setEngineWarning(visible) {
  const warning = document.getElementById("engineStatusWarning");
  if (warning) warning.hidden = !visible;
}

function normalizeDictionary(input) {
  const legacyCatalan = Array.isArray(input?.ca) ? input.ca : [];
  const sharedCatalan = [
    ...legacyCatalan,
    ...(Array.isArray(input?.["ca-ES"]) ? input["ca-ES"] : []),
    ...(Array.isArray(input?.["ca-ES-valencia"]) ? input["ca-ES-valencia"] : []),
    ...(Array.isArray(input?.["ca-ES-balear"]) ? input["ca-ES-balear"] : [])
  ];
  const sharedFrench = [...FRENCH_PROFILES, "fr"].flatMap(profile => Array.isArray(input?.[profile]) ? input[profile] : []);
  const profiles = Object.fromEntries(DICTIONARY_PROFILES.map(profile => {
    let values = profile.startsWith("ca-") ? sharedCatalan : (Array.isArray(input?.[profile]) ? input[profile] : []);
    if (profile === "es-ES" && !values.length && Array.isArray(input?.es)) values = input.es;
    if (profile === "en-US" && !values.length) values = Array.isArray(input?.en) ? input.en : Array.isArray(input?.en_US) ? input.en_US : [];
    const language = dictionaryLocale(profile);
    const unique = new Map();
    for (const value of values.map(cleanWord).filter(Boolean)) unique.set(value.toLocaleLowerCase(language), value);
    return [profile, [...unique.values()].sort((a, b) => a.localeCompare(b, language))];
  }));
  const frenchUnique = new Map();
  for (const value of sharedFrench.map(cleanWord).filter(Boolean)) frenchUnique.set(value.toLocaleLowerCase("fr"), value);
  profiles["fr-FR"] = [...frenchUnique.values()].sort((a, b) => a.localeCompare(b, "fr"));
  return profiles;
}
let latestExcludedSites = [];
function renderSitesFromCurrentSettings() { renderSites(latestExcludedSites); }
function cleanWord(value) {
  const word = String(value || "").trim().replace(/\s+/gu, " ");
  return word.length <= 80 && /[\p{L}\p{N}]/u.test(word) ? word : "";
}
function setNotice(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
async function saveDictionary() {
  dictionary = normalizeDictionary(dictionary);
  await chrome.storage.local.set({ personalDictionary: dictionary });
}
async function addWord(event) {
  event.preventDefault();
  const input = document.getElementById("newWord");
  const word = cleanWord(input.value);
  if (!word) return;
  const profile = selectedDictionaryProfile;
  const locale = dictionaryLocale(profile);
  if (dictionary[profile].some(value => value.toLocaleLowerCase(locale) === word.toLocaleLowerCase(locale))) {
    setNotice("dictionaryNotice", tr("alreadyThere")); return;
  }
  dictionary[profile].push(word);
  await saveDictionary(); input.value = "";
  setNotice("dictionaryNotice", tr("wordAdded", { word })); renderDictionary();
}
function renderDictionary() {
  const list = document.getElementById("wordList");
  const empty = document.getElementById("dictionaryEmpty");
  if (!list || !empty) return;
  const profile = selectedDictionaryProfile;
  const locale = dictionaryLocale(profile);
  const words = dictionary[profile] || [];
  const note = document.getElementById("dictionaryProfileNote");
  if (note) note.textContent = `${tr("dictionaryForProfile")}: ${dictionaryProfileLabel(profile)}`;
  const query = String(document.getElementById("wordSearch")?.value || "").toLocaleLowerCase(locale);
  const entries = words.filter(word => word.toLocaleLowerCase(locale).includes(query));
  list.replaceChildren(); empty.hidden = words.length > 0;
  if (!entries.length && words.length) {
    const li = document.createElement("li"); li.className = "empty"; li.textContent = tr("noMatches"); list.appendChild(li);
  }
  for (const word of entries) {
    const item = document.createElement("li");
    const label = document.createElement("span"); label.textContent = word;
    const remove = document.createElement("button"); remove.type = "button"; remove.textContent = tr("remove"); remove.setAttribute("aria-label", `${tr("remove")} ${word}`);
    remove.addEventListener("click", async () => {
      const profilesToUpdate = profile === "ca-ES" ? ["ca-ES", "ca-ES-valencia", "ca-ES-balear"] : [profile];
      for (const targetProfile of profilesToUpdate) dictionary[targetProfile] = dictionary[targetProfile].filter(value => value !== word);
      await saveDictionary(); renderDictionary(); setNotice("dictionaryNotice", tr("wordRemoved", { word }));
    });
    item.append(label, remove); list.appendChild(item);
  }
}
function exportDictionary() {
  const profile = selectedDictionaryProfile;
  const blob = new Blob([JSON.stringify({ version: 2, dictionaries: dictionary }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
  anchor.href = url; anchor.download = `corrector-dictionary-${profile}.json`; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice("dictionaryNotice", tr("dictionaryExported"));
}
async function importDictionary(event) {
  const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (parsed.dictionaries && typeof parsed.dictionaries === "object") {
      const incoming = normalizeDictionary(parsed.dictionaries);
      for (const profile of DICTIONARY_PROFILES) dictionary[profile] = [...dictionary[profile], ...incoming[profile]];
    } else {
      const incoming = Array.isArray(parsed) ? parsed : parsed.words;
      if (!Array.isArray(incoming)) throw new Error("El fitxer no conté una llista de paraules.");
      const profile = selectedDictionaryProfile;
      dictionary[profile] = [...dictionary[profile], ...incoming.map(cleanWord).filter(Boolean)];
    }
    await saveDictionary(); renderDictionary(); setNotice("dictionaryNotice", tr("dictionaryImported", { count: dictionary[selectedDictionaryProfile].length }));
  } catch (error) { setNotice("dictionaryNotice", `${tr("importFailed")}: ${String(error?.message || error)}`); }
}

async function refreshExcludedSites() {
  const { excludedSites = [] } = await chrome.storage.sync.get({ excludedSites: [] });
  renderSites(excludedSites);
}
async function toggleCurrentSite() {
  if (!currentHost) { setNotice("siteNotice", tr("unsupportedSiteExclusion")); return; }
  const { excludedSites = [] } = await chrome.storage.sync.get({ excludedSites: [] });
  const excludedEntry = excludedSites.find(host => hostCoversCurrentSite(host, currentHost));
  const updated = excludedEntry ? excludedSites.filter(host => host !== excludedEntry) : [...new Set([...excludedSites, normalizeSiteAddress(currentHost)])];
  await chrome.storage.sync.set({ excludedSites: updated }); renderSites(updated);
  setNotice("siteNotice", "");
}
function normalizeSiteAddress(value) {
  const input = String(value || "").trim();
  if (!input || /\s/u.test(input)) throw new Error(tr("invalidSiteAddress"));
  let url;
  try { url = new URL(/^[a-z][a-z\d+.-]*:\/\//iu.test(input) ? input : `https://${input}`); }
  catch (_) { throw new Error(tr("invalidSiteAddress")); }
  if (!["http:", "https:"].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error(tr("invalidSiteAddress"));
  return url.hostname.toLowerCase().replace(/\.$/u, "").replace(/^www\./u, "");
}
function hostCoversCurrentSite(excludedHost, host = currentHost) {
  const excluded = String(excludedHost || "").toLowerCase();
  const current = String(host || "").toLowerCase();
  return !!excluded && !!current && (current === excluded || current.endsWith(`.${excluded}`));
}
async function addExcludedSite(event) {
  event.preventDefault();
  const input = document.getElementById("siteAddress");
  try {
    const host = normalizeSiteAddress(input.value);
    const { excludedSites = [] } = await chrome.storage.sync.get({ excludedSites: [] });
    if (excludedSites.some(value => hostCoversCurrentSite(value, host) || hostCoversCurrentSite(host, value))) {
      input.value = "";
    setNotice("siteNotice", tr("siteAlreadyDisabled", { host }));
      input.focus();
      return;
    }
    const updated = [...new Set([...excludedSites, host])];
    await chrome.storage.sync.set({ excludedSites: updated });
    input.value = "";
    renderSites(updated);
    setNotice("siteNotice", tr("siteDisabled", { host }));
    input.focus();
  } catch (error) {
    setNotice("siteNotice", String(error?.message || tr("invalidSiteAddress")));
    input.focus();
  }
}
function renderSites(hosts) {
  latestExcludedSites = Array.isArray(hosts) ? hosts : [];
  const list = document.getElementById("siteList"); if (!list) return;
  list.replaceChildren();
  const excluded = latestExcludedSites.some(host => hostCoversCurrentSite(host));
  const current = document.getElementById("excludeCurrentSite");
  const siteState = document.getElementById("currentSiteState");
  if (current) { current.disabled = !currentHost; current.textContent = tr(excluded ? "enableHere" : "disableHere"); }
  if (siteState) {
    siteState.hidden = !currentHost;
    siteState.dataset.state = excluded ? "disabled" : "active";
    siteState.textContent = tr(excluded ? "siteDisabledState" : "siteActiveState");
  }
  const otherExcludedSites = latestExcludedSites.filter(host => !hostCoversCurrentSite(host));
  const empty = document.getElementById("siteListEmpty");
  if (empty) empty.hidden = otherExcludedSites.length > 0;
  for (const host of otherExcludedSites) {
    const item = document.createElement("li"); const label = document.createElement("span"); label.textContent = host;
    const button = document.createElement("button"); button.type = "button"; button.textContent = tr("enableSite"); button.setAttribute("aria-label", tr("enableSiteForHost", { host }));
    button.addEventListener("click", async () => {
      const latest = await chrome.storage.sync.get({ excludedSites: [] });
      const next = latest.excludedSites.filter(value => value !== host);
      await chrome.storage.sync.set({ excludedSites: next }); renderSites(next);
    });
    item.append(label, button); list.appendChild(item);
  }
}
async function resetToFactoryDefaults(event) {
  const button = event.currentTarget;
  button.disabled = true;
  button.textContent = tr("resetInProgress");
  try {
    const response = await chrome.runtime.sendMessage({ type: "RESET_EXTENSION_TO_FACTORY_DEFAULTS" });
    if (!response?.ok) throw new Error(response?.error || tr("resetFailed"));
    button.textContent = tr("resetRestarting");
    setTimeout(() => chrome.runtime.reload(), 500);
  } catch (error) {
    button.disabled = false;
    button.textContent = tr("confirmReset");
    setNotice("settingsNotice", `${tr("resetFailed")}: ${String(error?.message || error)}`);
  }
}
async function runDiagnostics(coldStart) {
  const output = document.getElementById("diagnostics"); output.style.display = "block";
  document.getElementById("copyEditorAnalysisBtn").hidden = true;
  output.textContent = coldStart ? tr("runningColdStart") : tr("collectingDiagnostics");
  const button = document.getElementById(coldStart ? "coldStartBtn" : "diagnosticsBtn"); button.disabled = true;
  try {
    let result;
    if (coldStart) result = await chrome.runtime.sendMessage({ type: "CL_COLD_START_DIAGNOSTICS", language: document.getElementById("language").value || "ca-ES" });
    else {
      let pageDiagnostics = null; let selectedFrameId = null; let pageBootstrapDiagnostics = [];
      if (activeTabId !== null) {
        selectedFrameId = 0;
        try {
          const frames = await chrome.scripting.executeScript({ target: { tabId: activeTabId, allFrames: true }, func: () => {
            const active = document.activeElement;
            let loaderProbe = null;
            try { loaderProbe = JSON.parse(document.documentElement?.dataset?.correctorLocalPerfProbeLoader || "null"); } catch (_) {}
            return { googleDocsDocument: location.hostname === "docs.google.com" && location.pathname.startsWith("/document/"),
              googleSlidesDocument: location.hostname === "docs.google.com" && location.pathname.startsWith("/presentation/"),
              activeElementEditable: Boolean(active && (active.isContentEditable || /^(INPUT|TEXTAREA)$/u.test(active.tagName) && !["password", "email", "url"].includes(active.type))),
              designMode: document.designMode === "on",
              loaderActive: Boolean(window.__CL_LOADER_ACTIVE),
              contentActive: Boolean(window.__CL_CONTENT_ACTIVE),
              loaderProbe };
          } });
          pageBootstrapDiagnostics = frames.map(frame => ({ ...(frame.result || {}), frameId: frame.frameId }));
          selectedFrameId = selectPageDiagnosticsFrame(pageBootstrapDiagnostics);
        } catch (_) {}
        pageDiagnostics = await chrome.tabs.sendMessage(activeTabId, { type: "CL_GET_PAGE_DIAGNOSTICS" }, { frameId: selectedFrameId }).catch(error => ({ ok: false, error: String(error?.message || error) }));
      }
      const engine = await chrome.runtime.sendMessage({ type: "CL_ENGINE_DIAGNOSTICS_FULL" });
      result = { ...engine, extensionVersion: manifest.version, selectedFrameId, pageBootstrapDiagnostics, pageDiagnostics };
    }
    latestDiagnostic = JSON.stringify(sanitizeDiagnostic(result), null, 2);
    output.textContent = latestDiagnostic; document.getElementById("copyDiagnosticsBtn").hidden = false;
  } catch (error) { output.textContent = `${tr("diagnosticsFailed")}: ${String(error?.message || error)}`; }
  finally { button.disabled = false; }
}
function installEditorPicker(tabId, language) {
  window.__CL_EDITOR_PICKER_CLEANUP?.();
  const messages = {
    ca: ["Clica el text que falla · Esc per cancel·lar", "Captura desada. Obre Lletrium → Avançat → Analitzar editor i camps.", "Copiar captura", "Copiat"],
    es: ["Haz clic en el texto que falla · Esc para cancelar", "Captura guardada. Abre Lletrium → Avanzado → Analizar editor y campos.", "Copiar captura", "Copiado"],
    en: ["Click the failing text · Esc to cancel", "Capture saved. Open Lletrium → Advanced → Analyze editor and fields.", "Copy capture", "Copied"]
  };
  const labels = messages[language] || messages.en;
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647";
  const shadow = host.attachShadow({ mode: "closed" });
  const outline = document.createElement("div");
  outline.style.cssText = "position:fixed;border:2px solid #536bdb;border-radius:4px;background:#536bdb18;box-sizing:border-box;pointer-events:none";
  const notice = document.createElement("div");
  notice.style.cssText = "position:fixed;top:12px;left:12px;max-width:520px;padding:12px 16px;background:#242832;color:white;border-radius:10px;font:14px/1.5 system-ui;box-shadow:0 4px 20px #0005;pointer-events:auto";
  notice.textContent = labels[0];
  shadow.append(outline, notice);
  (document.documentElement || document.body).append(host);
  const cursor = document.createElement("style");
  cursor.textContent = "* { cursor: crosshair !important; }";
  document.documentElement.append(cursor);
  const parent = node => node?.parentElement || node?.getRootNode?.()?.host || null;
  const describe = element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const attrs = {};
    for (const key of ["role", "contenteditable", "spellcheck", "aria-hidden", "aria-readonly", "disabled", "readonly", "type", "lang", "data-testid"]) {
      if (element.hasAttribute(key)) attrs[key] = element.getAttribute(key);
    }
    return { tag: element.localName, classes: Array.from(element.classList || []).slice(0, 16), attributes: attrs,
      isContentEditable: element.isContentEditable, hidden: element.hidden,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      styles: Object.fromEntries(["display", "visibility", "opacity", "content-visibility", "pointer-events", "position", "overflow-x", "overflow-y", "transform", "zoom", "contain", "z-index"].map(key => [key, style.getPropertyValue(key)])) };
  };
  let timeout;
  const stopPicking = () => {
    document.removeEventListener("pointermove", move, true);
    document.removeEventListener("click", pick, true);
    document.removeEventListener("keydown", key, true);
    cursor.remove();
    outline.remove();
    clearTimeout(timeout);
  };
  const cleanup = () => { stopPicking(); host.remove(); };
  const move = event => {
    const element = event.composedPath()[0];
    if (!(element instanceof Element) || element === host) return;
    const rect = element.getBoundingClientRect();
    Object.assign(outline.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
  };
  const key = event => { if (event.key === "Escape") { event.preventDefault(); cleanup(); } };
  const pick = async event => {
    const element = event.composedPath()[0];
    if (!(element instanceof Element) || element === host) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    stopPicking();
    try {
      const ancestors = [];
      let editable = null;
      for (let node = element; node && ancestors.length < 24; node = parent(node)) {
        ancestors.push(describe(node));
        if (!editable && (node.isContentEditable || node.matches("textarea,input"))) editable = node;
      }
      let loader = null;
      try { const latest = JSON.parse(document.documentElement.dataset.correctorLocalPerfProbeLoader || "null")?.latest; if (latest) loader = { event: latest.event, error: latest.error || null, importStage: latest.importStage || null }; } catch (_) {}
      const capture = { kind: "lletrium-picked-editor", tabId, capturedAt: new Date().toISOString(), host: location.hostname,
        loaderRevision: window.__CL_LOADER_REVISION || null, loader, contentActive: !!window.__CL_CONTENT_ACTIVE,
        pointer: { x: event.clientX, y: event.clientY }, ancestors,
        editable: editable ? describe(editable) : null,
        descendantStructure: editable ? Array.from(editable.querySelectorAll("*")).slice(0, 60).map(describe) : [],
        privacy: "Structure and computed styles only; no text, input values, HTML, or URL path." };
      capture.selectedTextLength = editable && !editable.matches("input[type='password']")
        ? (editable.isContentEditable ? String(editable.textContent || "").length : String(editable.value || "").length) : null;
      try {
        capture.extensionAnalysis = typeof window.__CL_CAPTURE_EDITOR_ANALYSIS === "function"
          ? window.__CL_CAPTURE_EDITOR_ANALYSIS(editable || element)
          : { available: false, reason: "content-analysis-hook-not-loaded" };
      } catch (error) {
        capture.extensionAnalysis = { available: false, error: String(error?.message || error) };
      }
      await chrome.storage.local.set({ editorPickedCapture: capture });
      notice.textContent = labels[1];
      const copy = document.createElement("button");
      copy.textContent = labels[2];
      copy.style.cssText = "display:block;margin-top:8px;padding:7px 12px;border:0;border-radius:6px;cursor:pointer;background:#536bdb;color:white";
      copy.onclick = async () => { try { await navigator.clipboard.writeText(JSON.stringify(capture, null, 2)); copy.textContent = labels[3]; } catch (error) { notice.textContent = String(error?.message || error); } };
      const close = document.createElement("button");
      close.textContent = "×";
      close.style.cssText = "margin-left:10px;cursor:pointer";
      close.onclick = cleanup;
      notice.append(copy, close);
    } catch (error) { notice.textContent = String(error?.message || error); }
  };
  window.__CL_EDITOR_PICKER_CLEANUP = cleanup;
  document.addEventListener("pointermove", move, true);
  document.addEventListener("click", pick, true);
  document.addEventListener("keydown", key, true);
  timeout = setTimeout(cleanup, 60000);
}

async function runEditorAnalysis() {
  const output = document.getElementById("diagnostics");
  const button = document.getElementById("editorAnalysisBtn");
  const status = document.getElementById("editorAnalysisStatus");
  output.style.display = "block";
  output.textContent = tr("collectingDiagnostics");
  button.disabled = true;
  document.getElementById("copyEditorAnalysisBtn").hidden = true;
  document.getElementById("copyDiagnosticsBtn").hidden = true;
  try {
    if (!Number.isInteger(activeTabId)) throw new Error(tr("editorAnalysisNoTab"));
    const domFrames = await chrome.scripting.executeScript({
      target: { tabId: activeTabId, allFrames: true },
      func: () => {
        const selector = "textarea,input:not([type]),input[type=''],input[type='text'],input[type='search'],input[type='email'],input[type='url'],input[type='tel'],input[type='number'],[contenteditable],[role='textbox']";
        const nodes = [];
        const seen = new Set();
        const seenRoots = new Set();
        const roots = [document];
        while (roots.length) {
          const root = roots.pop();
          if (!root || seenRoots.has(root)) continue;
          seenRoots.add(root);
          try {
            for (const host of root.querySelectorAll("*")) {
              if (host.shadowRoot && !seenRoots.has(host.shadowRoot)) roots.push(host.shadowRoot);
            }
            for (const el of root.querySelectorAll(selector)) {
              if (el.matches("input[type='password']")) continue;
              if (!seen.has(el) && !el.closest(".corrector-local-root,.corrector-local-card,.corrector-local-panel")) {
                seen.add(el);
                nodes.push(el);
              }
            }
          } catch (_) {}
        }
        const active = document.activeElement;
        const describe = el => {
          const type = String(el.getAttribute("type") || "").toLowerCase();
          const tag = String(el.localName || "").toLowerCase();
          if (tag === "input" && type === "password") return null;
          const rect = el.getBoundingClientRect();
          const classes = String(el.className?.baseVal || el.className || "").split(/\s+/u).filter(Boolean).slice(0, 12);
          const path = [];
          for (let node = el, depth = 0; node && depth < 5; node = node.parentElement, depth++) {
            path.push({ tag: String(node.localName || "").toLowerCase(), classes: String(node.className?.baseVal || node.className || "").split(/\s+/u).filter(Boolean).slice(0, 8) });
          }
          return {
            tag, type, role: String(el.getAttribute("role") || ""), classes,
            testId: String(el.getAttribute("data-testid") || "").slice(0, 100),
            contentEditable: !!el.isContentEditable,
            spellcheck: String(el.getAttribute("spellcheck") || ""),
            disabled: !!el.disabled, readOnly: !!el.readOnly,
            textLength: el.isContentEditable ? String(el.innerText || "").length : (tag === "textarea" || (tag === "input" && type !== "email" && type !== "url") ? String(el.value || "").length : null),
            visible: rect.width > 0 && rect.height > 0 && rect.bottom >= 0 && rect.top <= innerHeight,
            rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
            path
          };
        };
        const isActiveEditor = el => el === active || el.contains?.(active);
        const ordered = [...nodes].sort((a, b) => Number(isActiveEditor(b)) - Number(isActiveEditor(a)));
        let loaderProbe = null;
        try {
          const probe = JSON.parse(document.documentElement?.dataset?.correctorLocalPerfProbeLoader || "null");
          const latest = probe?.latest;
          if (latest) loaderProbe = { event: latest.event, at: latest.at, importStage: latest.importStage || null, error: latest.error || null };
        } catch (_) {}
        return {
          host: location.hostname, origin: location.origin, readyState: document.readyState,
          extensionLoaderActive: window.__CL_LOADER_ACTIVE === true,
          loaderRevision: window.__CL_LOADER_REVISION || "older-loader-without-revision",
          loaderProbe,
          extensionContentActive: window.__CL_CONTENT_ACTIVE === true,
          focusedField: active instanceof Element ? describe(active) : null,
          candidateCount: nodes.length,
          truncatedCandidateCount: Math.max(0, nodes.length - 40),
          candidates: ordered.slice(0, 40).map(describe)
        };
      }
    });
    const frames = await Promise.all((domFrames || []).map(async frame => {
      let extension = null;
      try {
        extension = await chrome.tabs.sendMessage(activeTabId, { type: "CL_ANALYZE_EDITORS_PAGE" }, { frameId: frame.frameId });
      } catch (error) {
        extension = { ok: false, error: String(error?.message || error) };
      }
      return { frameId: frame.frameId, dom: frame.result || null, extension };
    }));
    const report = {
      kind: "lletrium-page-editor-analysis",
      capturedAt: new Date().toISOString(),
      privacy: "No editor text, input values, title, or URL path is included. Text lengths only.",
      extensionVersion: manifest.version,
      frameCount: frames.length,
      frames
    };
    const picked = (await chrome.storage.local.get("editorPickedCapture")).editorPickedCapture;
    if (picked?.tabId === activeTabId) report.pickedTarget = picked;
    latestDiagnostic = JSON.stringify(sanitizeDiagnostic(report), null, 2);
    output.textContent = latestDiagnostic;
    document.getElementById("copyEditorAnalysisBtn").hidden = false;
    const editableCount = frames.reduce((sum, frame) => sum + Number(frame.dom?.candidateCount || 0), 0);
    const activeCount = frames.filter(frame => frame.extension?.analysis?.activeEditor).length;
    status.textContent = `${tr("editorAnalysisDone")} · ${editableCount} ${tr("editorAnalysisFields")} · ${activeCount} ${tr("editorAnalysisActive")}`;
  } catch (error) {
    output.textContent = `${tr("diagnosticsFailed")}: ${String(error?.message || error)}`;
    status.textContent = tr("editorAnalysisFailed");
  } finally {
    button.disabled = false;
  }
}
async function copyEditorAnalysis() {
  try {
    await navigator.clipboard.writeText(latestDiagnostic || document.getElementById("diagnostics").textContent);
    document.getElementById("editorAnalysisStatus").textContent = tr("editorAnalysisCopied");
  } catch (_) {
    document.getElementById("editorAnalysisStatus").textContent = tr("diagnosticsCopyFailed");
  }
}
function selectPageDiagnosticsFrame(frames) {
  const list = Array.isArray(frames) ? frames : [];
  const topFrame = list.find(frame => frame?.frameId === 0) || null;
  if (topFrame?.googleDocsDocument || topFrame?.googleSlidesDocument) return 0;
  const editor = list.find(frame => frame?.contentActive && (frame?.activeElementEditable || frame?.designMode))
    || list.find(frame => frame?.contentActive);
  return Number.isInteger(editor?.frameId) ? editor.frameId : Number.isInteger(topFrame?.frameId) ? topFrame.frameId : 0;
}
async function preloadNow() {
  const output = document.getElementById("diagnostics"); output.style.display = "block"; output.textContent = tr("loading");
  const button = document.getElementById("preloadBtn"); button.disabled = true;
  try {
  const result = await chrome.runtime.sendMessage({ type: "CL_FORCE_PRELOAD_ENGINE", language: document.getElementById("language").value || "ca-ES", keepAlive: true });
    latestDiagnostic = JSON.stringify(sanitizeDiagnostic(result), null, 2);
    output.textContent = result?.ok ? `${tr("ready")}\n\n${latestDiagnostic}` : latestDiagnostic;
    document.getElementById("copyDiagnosticsBtn").hidden = false;
  } catch (error) { output.textContent = `${tr("engineError")}: ${String(error?.message || error)}`; }
  finally { button.disabled = false; }
}
async function copyDiagnostics() {
  try { await navigator.clipboard.writeText(latestDiagnostic || document.getElementById("diagnostics").textContent); setNotice("settingsNotice", tr("diagnosticsCopied")); }
  catch (_) { setNotice("settingsNotice", tr("diagnosticsCopyFailed")); }
}
function sanitizeDiagnostic(value, key = "") {
  const normalized = String(key).replace(/[^a-z0-9]/giu, "").toLowerCase();
  if (privateDiagnosticKeys.has(normalized)) return "[omès]";
  if (Array.isArray(value)) return value.map(item => sanitizeDiagnostic(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, sanitizeDiagnostic(childValue, childKey)]));
  return value;
}
