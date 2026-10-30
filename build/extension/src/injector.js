/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
(() => {
  if (window.__correctorLocalInjectorLoaded) return;
  window.__correctorLocalInjectorLoaded = true;

  function injectExecutor() {
    if (document.documentElement.dataset.correctorLocalExecutorInjected === "1") return;
    document.documentElement.dataset.correctorLocalExecutorInjected = "1";
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("src/executor.js");
    script.async = false;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  }

  document.addEventListener("corrector-local-inject-executor", injectExecutor);
})();
