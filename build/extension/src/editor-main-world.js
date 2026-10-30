/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
(() => {
  if (window.__correctorLocalEditorBridgeLoaded) return;
  window.__correctorLocalEditorBridgeLoaded = true;

  const EVENT = "corrector-local-editor-model-request";
  const RESPONSE_KEY = "correctorLocalEditorModelResponse";
  const MAX_SOURCE_LENGTH = 500000;
  const CHANGE_EVENT = "corrector-local-editor-model-change";
  const subscriptions = new WeakMap();

  function respond(value) {
    try { document.documentElement.dataset[RESPONSE_KEY] = JSON.stringify(value); } catch (_) {}
  }

  function getCodeMirror(editor) {
    if (!editor?.isConnected || editor.ownerDocument !== document
      || !editor.matches?.(".CodeMirror .CodeMirror-code")) return null;
    const wrapper = editor.closest(".CodeMirror");
    const instance = wrapper?.CodeMirror;
    if (typeof instance?.getValue !== "function" || typeof instance.getOption !== "function"
      || instance.getWrapperElement?.() !== wrapper) return null;
    return instance;
  }

  function getLanguageToolTextMode(editor) {
    const host = String(editor?.ownerDocument?.defaultView?.location?.hostname || "").toLowerCase();
    if ((host === "overleaf.com" || host.endsWith(".overleaf.com"))
      && editor?.closest?.("source-editor#editor")
      && typeof window._ide?.editorManager?.getCurrentDocValue === "function") return true;
    let probedMode = null;
    try {
      const modes = window.CodeMirror?.modes;
      if (modes) {
        const textModes = ["null", "htmlmixed", "htmlembedded", "markdown", "mbox", "textile",
          "tiddlywiki", "tiki", "xml", "mediawiki", "mw-tag-nowiki", "mw-tag-pre"];
        probedMode = Object.keys(modes).every(mode => textModes.includes(mode));
      }
    } catch (_) {}
    if (editor.ownerDocument.defaultView.location.hostname.endsWith("epd.de")) return true;
    if (typeof probedMode === "boolean") return probedMode;
    const container = editor.closest("div.CodeMirror");
    if (!container) return false;
    if (Array.from(container.classList).some(name => name.startsWith("cm-s") && name !== "cm-s-default")) return false;
    return !container.querySelector("div.CodeMirror-gutter-wrapper");
  }

  function getNodeOffset(instance, editor, node, source) {
    if (node?.nodeType !== Node.TEXT_NODE || !node.isConnected || !editor.contains(node)) return null;
    if (node.parentElement?.closest(".CodeMirror-linewidget,.CodeMirror-widget")) return null;
    const raw = node.nodeValue || "";
    if (!raw) return null;
    const line = node.parentElement?.closest("pre.CodeMirror-line");
    if (!line) return null;
    // CM5 keeps the source line handle next to each rendered line. This also
    // identifies lines when the viewport starts halfway through the document.
    const lineView = instance.display?.view?.find(view => view.text === line || view.text?.contains(node));
    const lineNumber = lineView ? instance.getLineNumber?.(lineView.line) : null;
    if (Number.isInteger(lineNumber)) {
      const prefixRange = document.createRange();
      prefixRange.selectNodeContents(line);
      prefixRange.setEnd(node, 0);
      const prefix = prefixRange.toString();
      const lineText = instance.getLine(lineNumber);
      if (lineText?.startsWith(prefix)) {
        const offset = instance.indexFromPos({ line: lineNumber, ch: prefix.length });
        if (source.slice(offset, offset + raw.length) === raw) return offset;
      }
    }
    // Collapsed/replaced spans can make DOM prefixes differ from the model.
    // Use the editor's coordinate mapping, then require exact source text.
    const range = document.createRange();
    range.selectNodeContents(node);
    const rect = Array.from(range.getClientRects()).find(box => box.height > 0 && box.width > 0);
    if (!rect || typeof instance.coordsChar !== "function") return null;
    const rtl = getComputedStyle(node.parentElement).direction === "rtl";
    const position = instance.coordsChar({ left: rtl ? rect.right - 0.1 : rect.left + 0.1,
      top: rect.top + rect.height / 2 }, "window");
    const offset = instance.indexFromPos(position);
    return Number.isInteger(offset) && source.slice(offset, offset + raw.length) === raw ? offset : null;
  }

  document.addEventListener(EVENT, event => {
    const request = event.detail;
    if (!request || request.responseKey !== RESPONSE_KEY) return;
    try {
      const editor = request.editor;
      if (request.action === "unsubscribe") {
        const subscription = editor && subscriptions.get(editor);
        if (subscription?.token === request.token) {
          subscription.dispose();
          subscriptions.delete(editor);
        }
        return respond({ ok: true });
      }
      const instance = getCodeMirror(editor);
      if (!instance) return respond({ ok: false, reason: "codemirror5-instance-unavailable" });
      const configured = instance.getOption("mode");
      const metadata = {
        ok: true, engine: "codemirror5",
        mode: typeof configured === "string" ? configured : String(configured?.name || ""),
        modeName: String(instance.getMode?.()?.name || ""),
        isTextMode: getLanguageToolTextMode(editor),
        readOnly: !!instance.getOption("readOnly"),
        lineCount: instance.lineCount()
      };
      if (request.action === "metadata") return respond(metadata);
      if (request.action === "selection") {
        if (!instance.hasFocus?.()) return respond({ ok: true, selection: null });
        const head = instance.getCursor("head"), anchor = instance.getCursor("anchor");
        const rect = instance.cursorCoords(head, "window");
        if (![rect.left, rect.right, rect.top, rect.bottom].every(Number.isFinite) || rect.bottom <= rect.top) {
          return respond({ ok: true, selection: null });
        }
        return respond({ ok: true, selection: {
          isCollapsed: head.line === anchor.line && head.ch === anchor.ch,
          direction: head.line < anchor.line || head.line === anchor.line && head.ch < anchor.ch ? "backward" : "forward",
          rects: [{ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom,
            width: rect.right - rect.left, height: rect.bottom - rect.top }]
        } });
      }
      if (request.action === "subscribe") {
        if (typeof request.token !== "string" || request.token.length > 128
          || typeof instance.on !== "function" || typeof instance.off !== "function") {
          return respond({ ok: false, reason: "editor-events-unavailable" });
        }
        subscriptions.get(editor)?.dispose();
        const notify = reason => {
          if (editor.isConnected) document.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { editor, reason } }));
        };
        const changes = () => notify("changes");
        const viewport = () => notify("viewport");
        const selection = () => notify("selection");
        const options = (_instance, option) => {
          if (option === "mode" || option === "readOnly") notify("options");
        };
        instance.on("changes", changes);
        instance.on("viewportChange", viewport);
        instance.on("cursorActivity", selection);
        instance.on("optionChange", options);
        subscriptions.set(editor, { token: request.token, dispose() {
          instance.off("changes", changes);
          instance.off("viewportChange", viewport);
          instance.off("cursorActivity", selection);
          instance.off("optionChange", options);
        } });
        return respond({ ok: true });
      }
      const text = instance.getValue("\n");
      if (typeof text !== "string" || text.length > MAX_SOURCE_LENGTH) {
        return respond({ ok: false, reason: "source-too-large" });
      }
      if (request.action === "snapshot") {
        const nodes = Array.isArray(request.nodes) ? request.nodes : [];
        const offsets = nodes.map(node => {
          try { return getNodeOffset(instance, editor, node, text); } catch (_) { return null; }
        });
        return respond({ ...metadata, text, offsets });
      }
      if (request.action === "replace") {
        const from = Number(request.from), to = Number(request.to);
        const expectedDocument = request.expectedDocument;
        if (metadata.readOnly || !Number.isInteger(from) || !Number.isInteger(to)
          || from < 0 || to <= from || to > text.length
          || typeof expectedDocument !== "string" || text !== expectedDocument
          || text.slice(from, to) !== request.expected || typeof request.insert !== "string") {
          return respond({ ok: false, reason: "source-range-changed-or-readonly" });
        }
        instance.focus();
        if (instance.getValue("\n") !== expectedDocument || instance.getOption("readOnly")) {
          return respond({ ok: false, reason: "source-changed-on-focus" });
        }
        const start = instance.posFromIndex(from), end = instance.posFromIndex(to);
        instance.replaceRange(request.insert, start, end, "+corrector-local");
        const expectedText = text.slice(0, from) + request.insert + text.slice(to);
        const applied = instance.getValue("\n") === expectedText;
        return respond({ ok: applied, applied });
      }
      respond({ ok: false, reason: "unsupported-editor-operation" });
    } catch (_) { respond({ ok: false, reason: "editor-bridge-operation-failed" }); }
  });
})();
