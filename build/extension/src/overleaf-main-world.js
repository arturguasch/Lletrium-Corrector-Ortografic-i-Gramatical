/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
(() => {
  if (window.__correctorLocalOverleafBridgeLoaded) return;
  window.__correctorLocalOverleafBridgeLoaded = true;

  const REQUEST_EVENT = "corrector-local-overleaf-request";
  const RESPONSE_KEY = "correctorLocalOverleafResponse";
  const MAX_SOURCE_LENGTH = 500000;

  function getEditorView() {
    try {
      const view = window.overleaf?.unstable?.store?.items?.get("editor.view")?.value;
      if (view?.state?.doc && typeof view.state.doc.sliceString === "function"
        && typeof view.posAtDOM === "function" && typeof view.dispatch === "function") return view;
    } catch (_) {}
    return null;
  }

  function respond(payload) {
    const root = document.documentElement;
    if (!root) return;
    try { root.dataset[RESPONSE_KEY] = JSON.stringify(payload); } catch (_) {}
  }

  document.addEventListener(REQUEST_EVENT, event => {
    if (location.hostname !== "overleaf.com" && !location.hostname.endsWith(".overleaf.com")) return;
    const request = event.detail;
    if (!request || request.responseKey !== RESPONSE_KEY) return;
    const view = getEditorView();
    if (!view) return respond({ ok: false, reason: "cm6-view-unavailable" });

    try {
      if (request.action === "snapshot") {
        const text = view.state.doc.sliceString(0);
        if (typeof text !== "string" || text.length > MAX_SOURCE_LENGTH) {
          return respond({ ok: false, reason: "source-too-large" });
        }
        const nodes = Array.isArray(request.nodes) ? request.nodes : [];
        const offsets = nodes.map(node => {
          try {
            if (!node?.isConnected || node.nodeType !== Node.TEXT_NODE) return null;
            const start = view.posAtDOM(node, 0);
            return Number.isInteger(start) ? start : null;
          } catch (_) { return null; }
        });
        return respond({ ok: true, engine: "codemirror6", text, offsets });
      }

      if (request.action === "replace") {
        const from = Number(request.from), to = Number(request.to);
        const insert = String(request.insert ?? "");
        const expected = String(request.expected ?? "");
        if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < from
          || to > view.state.doc.length || view.state.doc.sliceString(from, to) !== expected) {
          return respond({ ok: false, reason: "source-range-changed" });
        }
        view.dispatch({ changes: { from, to, insert } });
        return respond({ ok: true, applied: true });
      }
    } catch (_) {
      respond({ ok: false, reason: "bridge-operation-failed" });
    }
  });
})();
