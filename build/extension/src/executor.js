(() => {
  if (window.__correctorLocalExecutorLoaded) return;
  window.__correctorLocalExecutorLoaded = true;

  let policy = null;
  try {
    policy = window.trustedTypes?.createPolicy?.("CorrectorLocalExecutorPolicy", {
      createScript: code => code
    }) || null;
  } catch (_) {}

  function executeCode(event) {
    const code = event.detail?.code;
    if (!code) return;
    event.stopImmediatePropagation();
    const script = document.createElement("script");
    const nonceNode = document.querySelector("link[nonce],style[nonce],script[nonce]");
    if (nonceNode?.nonce) script.setAttribute("nonce", nonceNode.nonce);
    script.textContent = policy ? policy.createScript(code) : code;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  }

  function linkProperties() {
    document.querySelectorAll("[data-corrector-local-proxy]:not([data-corrector-local-linked])").forEach(proxy => {
      const targetId = proxy.getAttribute("data-corrector-local-proxy");
      const target = targetId ? document.querySelector(`[data-corrector-local-target='${CSS.escape(targetId)}']`) : null;
      if (!target) return;
      proxy.setAttribute("data-corrector-local-linked", "1");
      for (const key of [
        "selectionStart", "selectionEnd", "value", "textContent", "innerHTML",
        "innerText", "required", "maxLength", "disabled", "readOnly",
        "contentEditable", "isContentEditable"
      ]) {
        try {
          Object.defineProperty(proxy, key, {
            get: () => target[key],
            set: value => { target[key] = value; }
          });
        } catch (_) {}
      }
    });
  }

  function destroy() {
    document.removeEventListener("corrector-local-execute-code", executeCode);
    document.removeEventListener("corrector-local-link-properties", linkProperties);
    document.removeEventListener("corrector-local-execute-destroy", destroy);
  }

  document.addEventListener("corrector-local-execute-code", executeCode);
  document.addEventListener("corrector-local-link-properties", linkProperties);
  document.addEventListener("corrector-local-execute-destroy", destroy);
})();
