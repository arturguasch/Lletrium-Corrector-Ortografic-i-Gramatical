/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
(() => {
  const isGoogleDocs =
    location.hostname === "docs.google.com" &&
    location.pathname.startsWith("/document/");
  const isGoogleSlides =
    location.hostname === "docs.google.com" &&
    location.pathname.startsWith("/presentation/");
  const isGoogleEditor = isGoogleDocs || isGoogleSlides;
  const isGmail = location.hostname === "mail.google.com";
  const hasGoogleDocsAncestor = (() => {
    try {
      return Array.from(location.ancestorOrigins || []).some(origin => {
        try { return new URL(origin).hostname === "docs.google.com"; } catch (_) { return false; }
      });
    } catch (_) {
      return false;
    }
  })();
  const isSvgDocument = document.documentElement?.namespaceURI === "http://www.w3.org/2000/svg";
  const perfProbeStartedAt = Date.now();
  const EDITABLE_SELECTOR = [
    "textarea",
    "input[type='text']",
    "input[type='search']",
    "input:not([type])",
    "[contenteditable='true']",
    "[contenteditable='plaintext-only']",
    "[contenteditable='']"
  ].join(",");

  function reportPerfProbe(event, extra = {}) {
    const payload = {
      script: "loader",
      event,
      at: Date.now(),
      href: location.href,
      isTop: window.top === window,
      frameDepth: window.top === window ? 0 : 1,
      readyState: document.readyState,
      visibilityState: document.visibilityState,
      ...extra
    };
    try { window.top?.postMessage?.({ source: "corrector-local", type: "CL_PERF_PROBE", payload }, "*"); } catch (_) {}
    try {
      if (document.documentElement) {
        document.documentElement.dataset.correctorLocalPerfProbeLoader = JSON.stringify({
          startedAt: perfProbeStartedAt,
          latest: payload
        });
      }
    } catch (_) {}
  }

  reportPerfProbe("loader-script-start");

  function hasFocusedDocsEditable(event = null) {
    const candidates = [];
    try { candidates.push(...(event?.composedPath?.() || [])); } catch (_) {}
    candidates.push(document.activeElement, event?.target);
    for (const candidate of candidates) {
      if (!candidate || !(candidate.matches?.(EDITABLE_SELECTOR) || candidate.isContentEditable)) continue;
      if (candidate.disabled || candidate.readOnly || candidate.getAttribute?.("aria-readonly") === "true") continue;
      if (candidate === document.activeElement || candidate === event?.target
        || event?.composedPath?.().includes?.(candidate)) return true;
    }
    return false;
  }

  function installGoogleDocsFrameEditRelay() {
    if (!hasGoogleDocsAncestor || window.top === window || window.__CL_GDOCS_FRAME_EDIT_RELAY) return;
    window.__CL_GDOCS_FRAME_EDIT_RELAY = true;
    let pendingInputTimer = null;
    let pendingInputFromKeydown = false;
    let pendingExpectedClipboardAction = "";
    let suppressNextBeforeInput = false;
    let suppressNextInput = false;
    const clearPendingInput = () => {
      if (pendingInputTimer) clearTimeout(pendingInputTimer);
      pendingInputTimer = null;
      pendingInputFromKeydown = false;
      pendingExpectedClipboardAction = "";
      suppressNextBeforeInput = false;
      suppressNextInput = false;
    };
    const expectInputAfter = ({ keydown = false, clipboardAction = "" } = {}) => {
      if (pendingInputTimer) clearTimeout(pendingInputTimer);
      pendingInputFromKeydown = keydown;
      pendingExpectedClipboardAction = clipboardAction;
      suppressNextInput = !keydown;
      pendingInputTimer = setTimeout(clearPendingInput, 180);
    };
    const relay = (reason, event) => {
      if (!hasFocusedDocsEditable(event)) return;
      try {
        window.top.postMessage({
          source: "corrector-local",
          type: "CL_GDOCS_FRAME_EDIT",
          reason,
          trusted: !!event?.isTrusted,
          at: Date.now()
        }, "*");
      } catch (_) {}
    };
    const isEditingKey = event => {
      if (!event) return false;
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return ["v", "x", "z", "y", "backspace", "delete"].includes(String(event.key || "").toLowerCase());
      }
      return event.key === "Backspace" || event.key === "Delete" || event.key === "Enter" || event.key === "Tab"
        || (typeof event.key === "string" && event.key.length === 1);
    };
    document.addEventListener("beforeinput", event => {
      if (suppressNextBeforeInput) {
        suppressNextBeforeInput = false;
        suppressNextInput = true;
        return;
      }
      if (pendingInputFromKeydown) {
        pendingInputFromKeydown = false;
        suppressNextInput = true;
        return;
      }
      if (pendingExpectedClipboardAction) return;
      relay("beforeinput", event);
      expectInputAfter();
    }, true);
    document.addEventListener("input", event => {
      if (pendingInputFromKeydown || suppressNextInput || pendingExpectedClipboardAction) {
        clearPendingInput();
        return;
      }
      relay("input", event);
    }, true);
    document.addEventListener("keydown", event => {
      if (!isEditingKey(event)) return;
      const key = String(event.key || "").toLowerCase();
      const clipboardAction = (event.ctrlKey || event.metaKey) && key === "v" ? "paste"
        : (event.ctrlKey || event.metaKey) && key === "x" ? "cut" : "";
      clearPendingInput();
      relay("keydown", event);
      expectInputAfter({ keydown: true, clipboardAction });
    }, true);
    document.addEventListener("paste", event => {
      if (pendingExpectedClipboardAction === "paste") {
        pendingInputFromKeydown = false;
        suppressNextInput = true;
        suppressNextBeforeInput = true;
        pendingExpectedClipboardAction = "";
        return;
      }
      clearPendingInput();
      relay("paste", event);
      expectInputAfter();
      suppressNextBeforeInput = true;
    }, true);
    document.addEventListener("cut", event => {
      if (pendingExpectedClipboardAction === "cut") {
        pendingInputFromKeydown = false;
        suppressNextInput = true;
        suppressNextBeforeInput = true;
        pendingExpectedClipboardAction = "";
        return;
      }
      clearPendingInput();
      relay("cut", event);
      expectInputAfter();
      suppressNextBeforeInput = true;
    }, true);
    document.addEventListener("drop", event => {
      clearPendingInput();
      relay("drop", event);
      expectInputAfter();
      suppressNextBeforeInput = true;
    }, true);
  }

  if (window.top !== window && hasGoogleDocsAncestor && !isGoogleDocs) {
    installGoogleDocsFrameEditRelay();
    return;
  }
  function hasGoogleDocsEditorPage() {
    const editor = document.querySelector(".kix-appview-editor");
    if (editor && !document.querySelector(".kix-page-paginated")) return true;
    return !!document.querySelector(
      "div.kix-appview-editor > div:not([class]):not([style*='display: none']):not([style*='position: absolute']):not(:has(> .appsElementsPositionedSurfaceContainer)) div.kix-rotatingtilemanager > div.kix-rotatingtilemanager-content > div.kix-page-paginated"
    );
  }
  function isGoogleDocsFrameSupported() {
    return window.top === window || (window.innerHeight >= 100 && hasGoogleDocsEditorPage());
  }
  function hasGoogleSlidesEditorPage() {
    return window.top === window
      && !!document.querySelector(".workspace-container div#pages > svg > g, .workspace-container div.pages > svg > g");
  }
  if (isGoogleDocs && window.top !== window && window.innerHeight < 100) return;
  if (window.__CL_LOADER_ACTIVE || window.__CL_CONTENT_ACTIVE) return;
  window.__CL_LOADER_ACTIVE = true;
  window.__CL_LOADER_REVISION = "generic-bootstrap-slides-canvas-20261029-1";

  let loaded = false;
  let observer = null;
  let pollTimer = null;
  let docsDeferredLoadTimer = null;
  let genericDeferredLoadTimer = null;
  let docsActivationAllowed = !isGoogleDocs;
  let genericActivationTimer = null;
  let lastGenericActivationAt = 0;
  let retryContentLoadAfter = 0;

  function hasEditableInFocus(node = document.activeElement, depth = 0) {
    if (!node || depth > 8) return false;
    if ((node.matches?.(EDITABLE_SELECTOR) || node.isContentEditable) && isEligibleEditable(node)) return true;
    const shadowActive = node.shadowRoot?.activeElement;
    return !!shadowActive && hasEditableInFocus(shadowActive, depth + 1);
  }

  function isEligibleEditable(node) {
    if (!node || node.disabled || node.readOnly) return false;
    // LanguageTool does not create an editor in tiny frames and ignores fully
    // hidden editor targets. Google Docs uses its own page-level adapter.
    if (!isGoogleDocs && (window.innerWidth < 100 || window.innerHeight < 20)) return false;
    for (let current = node; current && current.nodeType === Node.ELEMENT_NODE;
      current = current.parentElement || current.getRootNode?.()?.host || null) {
      if (current.getAttribute?.("aria-readonly") === "true") return false;
      if (current.hidden) return false;
      try {
        const style = getComputedStyle(current);
        if (style.opacity === "0" || style.display === "none" || (current === node && (style.visibility === "hidden" || style.visibility === "collapse"))
          || style.contentVisibility === "hidden") return false;
      } catch (_) {}
    }
    const notionHost = /(^|\.)notion\.(so|site)$/iu.test(location.hostname);
    // Gmail disables native spellchecking on its compose editor. Allow that
    // site-specific textbox through the bootstrap gate so the Gmail adapter
    // can take over; unrelated spellcheck-disabled fields remain excluded.
    const isGmailComposer = isGmail && node.matches?.("[contenteditable='true'][role='textbox']");
    if (node.getAttribute?.("spellcheck") === "false" && !node.getAttribute?.("lang")
      && !node.getAttribute?.("data-lt-tmp-id") && !notionHost && !isGmailComposer) return false;
    return true;
  }

  function hasVisibleEditable() {
    const nodes = document.querySelectorAll(EDITABLE_SELECTOR);
    for (const node of nodes) {
      const rect = node.getBoundingClientRect();
      if (rect.width > 20 && rect.height > 12 && rect.bottom >= 0 && rect.top <= window.innerHeight) return true;
    }
    return false;
  }

  function shouldLoadNow() {
    if (isGoogleDocs && !docsActivationAllowed) return false;
    if (isGoogleDocs && !isGoogleDocsFrameSupported()) return false;
    // Google Slides renders slide text as SVG and does not expose a normal
    // contenteditable until a text object is actively being edited. Load the
    // page adapter once the presentation canvas exists so it can inspect the
    // selected slide and follow later text edits.
    if (isGoogleSlides && !hasGoogleSlidesEditorPage()) return false;
    if (document.designMode === "on") return true;
    // Gmail retains and restores focus while opening its compose window and
    // browser actions. Bootstrap from the visible compose surface itself;
    // leave adapter eligibility to content.js once it is available.
    if (isGmail && window.top === window) {
      for (const editor of document.querySelectorAll("[contenteditable='true'][role='textbox']")) {
        const rect = editor.getBoundingClientRect();
        if (rect.width > 20 && rect.height > 12 && rect.bottom >= 0 && rect.top <= innerHeight) return true;
      }
    }
    // LanguageTool's child-frame bootstrap waits for an editable surface
    // (textarea/contenteditable), not a standalone native input. Keep text and
    // search inputs supported in the main document, where its generic reader
    // supports them, but don't wake the extension for input-only subframes.
    if ((window.top !== window || isSvgDocument) && !isGoogleEditor
      && !hasLTCompatibleFrameFocus() && !hasNestedLTInstalledFrame()) return false;
    if ((window.top !== window || isSvgDocument) && hasNestedLTInstalledFrame()) return true;
    if (hasEditableInFocus()) return true;
    if (isGoogleDocs) return hasVisibleEditable();
    return isGoogleSlides;
  }

  function hasLTCompatibleFrameFocus(node = document.activeElement, depth = 0) {
    if (!node || depth > 8) return false;
    if ((node.isContentEditable || node.nodeName === "TEXTAREA") && isEligibleEditable(node)) return true;
    const shadowActive = node.shadowRoot?.activeElement;
    return !!shadowActive && hasLTCompatibleFrameFocus(shadowActive, depth + 1);
  }

  function hasNestedLTInstalledFrame() {
    try { return !!document.querySelector("iframe[data-lt-installed]"); } catch (_) { return false; }
  }

  function clearGenericActivationTimer() {
    if (genericActivationTimer) clearTimeout(genericActivationTimer);
    genericActivationTimer = null;
  }

  function scheduleGenericLoad(reason, delay = 750) {
    if (loaded || isGoogleEditor) return;
    // Continuous DOM mutations must not postpone an already queued startup.
    // Keep this pending through the idle callback as well as its initial delay.
    if (genericActivationTimer !== null) return;
    if (!shouldLoadNow()) return;
    const now = Date.now();
    if (now - lastGenericActivationAt < 250) return;
    lastGenericActivationAt = now;
    const run = () => {
      genericActivationTimer = null;
      if (!loaded && shouldLoadNow()) loadContent().catch(error => {
        loaded = false;
        console.warn("[Autocorrector] No he pogut activar el corrector", error);
      });
    };
    if (typeof requestIdleCallback === "function") {
      genericActivationTimer = setTimeout(() => requestIdleCallback(run, { timeout: 1800 }), delay);
    } else {
      genericActivationTimer = setTimeout(run, delay);
    }
    reportPerfProbe("generic-load-scheduled", { reason, delay });
  }

  async function loadContent() {
    if (isGoogleDocs && !isGoogleDocsFrameSupported()) return;
    if (isGoogleSlides && !hasGoogleSlidesEditorPage()) return;
    if (loaded) return;
    if (Date.now() < retryContentLoadAfter) return;
    reportPerfProbe("loadContent-called");
    loaded = true;
    clearGenericActivationTimer();
    let importStage = "es-explanation-translations";
    try {
      await import(chrome.runtime.getURL("src/es-explanation-translations.js"));
      importStage = "en-explanation-translations-extra";
      await import(chrome.runtime.getURL("src/en-explanation-translations-extra.js"));
      importStage = "en-explanation-translations";
      await import(chrome.runtime.getURL("src/en-explanation-translations.js"));
      importStage = "ui-localization";
      await import(chrome.runtime.getURL("src/ui-localization.js"));
      importStage = "paint-runtime";
      await import(chrome.runtime.getURL("src/paint-runtime.js"));
      importStage = "content";
      await import(chrome.runtime.getURL("src/content.js"));
      reportPerfProbe("after-import-content");
    } catch (error) {
      loaded = false;
      retryContentLoadAfter = Date.now() + 3000;
      reportPerfProbe("content-import-failed", { importStage, error: String(error?.message || error) });
      throw error;
    }
    if (observer) observer.disconnect();
    if (pollTimer) clearInterval(pollTimer);
    if (docsDeferredLoadTimer) clearTimeout(docsDeferredLoadTimer);
    if (genericDeferredLoadTimer) clearTimeout(genericDeferredLoadTimer);
  }

  function tryLoad() {
    if (!shouldLoadNow()) return;
    reportPerfProbe("tryLoad-activated");
    loadContent().catch(error => {
      loaded = false;
      console.warn("[Autocorrector] No he pogut activar el corrector", error);
    });
  }

  if (isGoogleDocs) {
    document.addEventListener("focusin", tryLoad, true);
    document.addEventListener("input", tryLoad, true);
    for (const eventName of ["keydown", "pointerdown"]) {
      document.addEventListener(eventName, () => {
        docsActivationAllowed = true;
        loadContent().catch(console.warn);
      }, { once: true, capture: true });
    }
  } else if (isGoogleSlides) {
    document.addEventListener("focusin", tryLoad, true);
    document.addEventListener("pointerdown", tryLoad, true);
  } else {
    document.addEventListener("focusin", () => scheduleGenericLoad("focusin", 650), true);
    document.addEventListener("input", () => scheduleGenericLoad("input", 1400), true);
    document.addEventListener("pointerdown", () => scheduleGenericLoad("pointerdown", 900), true);
  }
  document.addEventListener("selectionchange", () => {
    if (hasEditableInFocus()) tryLoad();
  }, true);

  if (document.documentElement) {
    observer = new MutationObserver(() => {
      if (!loaded && shouldLoadNow()) {
        if (isGoogleEditor) loadContent().catch(console.warn);
        else scheduleGenericLoad("mutation", 1200);
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  pollTimer = setInterval(() => {
    if (isGoogleEditor) tryLoad();
    else if (hasEditableInFocus()) scheduleGenericLoad("poll", 1200);
  }, isGoogleEditor ? 1500 : 3500);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryLoad, { once: true });
  } else {
    tryLoad();
  }

  if (isGoogleEditor) {
    const deferGoogleEditorLoad = () => {
      if (loaded || docsDeferredLoadTimer) return;
      docsActivationAllowed = true;
      reportPerfProbe(isGoogleSlides ? "slides-content-load-scheduled" : "docs-content-load-scheduled", { readyState: document.readyState });
      docsDeferredLoadTimer = setTimeout(() => {
        docsDeferredLoadTimer = null;
        if (loaded) return;
        reportPerfProbe(isGoogleSlides ? "slides-content-load-attempt" : "docs-content-load-attempt");
        loadContent().catch(error => console.warn("[Lletrium] No he pogut activar el corrector a Google Workspace", error));
      }, 250);
    };
    if (document.readyState === "complete") deferGoogleEditorLoad();
    else window.addEventListener("load", () => {
      reportPerfProbe(isGoogleSlides ? "slides-window-load" : "window-load");
      deferGoogleEditorLoad();
    }, { once: true });
  } else {
    const deferGenericLoad = () => {
      if (loaded) return;
      const run = () => {
        if (shouldLoadNow()) loadContent().catch(console.warn);
      };
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(run, { timeout: 4500 });
      } else {
        genericDeferredLoadTimer = setTimeout(run, 2500);
      }
    };
    if (document.readyState === "complete") deferGenericLoad();
    else window.addEventListener("load", () => {
      reportPerfProbe("window-load");
      deferGenericLoad();
    }, { once: true });
  }
})();
