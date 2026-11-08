(() => {
  // The Docs print/export renderer is not an editor. Avoid touching its canvas
  // APIs or adding extension bridge state so printed page geometry stays native.
  if (location.hostname === "docs.google.com"
    && /\/document\/.*\/(?:print|export)(?:\/|$)/u.test(location.pathname)) return;
  if (window.__correctorLocalGDocsV10Loaded) return;
  window.__correctorLocalGDocsV10Loaded = true;
  const perfProbeStartedAt = Date.now();

  function reportPerfProbe(event, extra = {}) {
    const payload = {
      script: "gdocs-main-world",
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
        document.documentElement.dataset.correctorLocalPerfProbeGdocsMain = JSON.stringify({
          startedAt: perfProbeStartedAt,
          latest: payload
        });
      }
    } catch (_) {}
  }

  reportPerfProbe("gdocs-main-world-script-start");
  const extensionId = "pnhacijlkiglebdecijdonkgjnlkhlnn";

  try {
    // Google Docs has historically used these flags for extensions that need HTML
    // rendering or annotated canvas. They may be ignored if the extension is not
    // allowed by Google, but setting them must not break Docs.
  window._docs_annotate_canvas_by_ext = extensionId;
  window._docs_annotate_canvas_by_ext_ = extensionId;
  } catch (_) {}

  try {
    document.documentElement?.setAttribute("data-corrector-local-gdocs-bridge-ready", "true");
    window.postMessage({
      source: "corrector-local",
      type: "CL_GDOCS_SAFE_MAIN_LOADED_V8930"
    }, "*");
  } catch (_) {}

  const CANVAS_TEXT = {
    items: [],
    scheduled: 0,
    lastPostAt: 0,
    lastDrawPostAt: 0,
    maxItems: 1800,
    epoch: 0,
    viewportSignature: "",
    lastResetAt: 0
  };
  const CANVAS_LINES = new WeakMap();
  const LAST_MOVE_TO = new WeakMap();
  const GOOGLE_NATIVE_LINE_COLORS = new Set(["#dd0000", "#4285f4"]);
  const GOOGLE_NATIVE_FILL_COLORS = new Set(["#fce8e6", "#e8f0fe"]);
  const LT_TRANSPARENT_UNDERLINE_COLOR = /rgba\(\s*(31,\s*161,\s*93|255,\s*0,\s*122|0,\s*163,\s*187|119,\s*119,\s*119|19,\s*115,\s*51|184,\s*6,\s*114|147,\s*52,\s*230|163,\s*90,\s*0)\s*,\s*0\./iu;
  let cachedKixTextPath = null;
  // The content script synchronizes native-mark suppression with the user's
  // settings and the extension's enabled state.
  // Suppress from the first Docs draw, before asynchronous settings arrive.
  // Read the persistent policy as well, in case content initialized first.
  let suppressGoogleNativeMarks = document.documentElement?.getAttribute("data-corrector-local-gdocs-native-suppression") !== "disabled";
  function shouldSuppressGoogleNativeMarks() {
    const policy = document.documentElement?.getAttribute("data-corrector-local-gdocs-native-suppression");
    return policy === "enabled" ? true : policy === "disabled" ? false : suppressGoogleNativeMarks;
  }
  let annotatedTextPending = null;
  let annotatedTextCache = null;

  function clearCanvasTextForViewportMove(reason = "viewport", options = {}) {
    const requestedEpoch = Number(options.epoch);
    CANVAS_TEXT.epoch = Number.isFinite(requestedEpoch)
      ? requestedEpoch
      : CANVAS_TEXT.epoch + 1;
    CANVAS_TEXT.viewportSignature = String(options.viewportSignature || "");
    CANVAS_TEXT.lastResetAt = Date.now();
    CANVAS_TEXT.items = [];
    CANVAS_TEXT.lastPostAt = 0;
    CANVAS_TEXT.lastDrawPostAt = 0;
    try {
      window.postMessage({
        source: "corrector-local",
        type: "CL_GDOCS_CANVAS_TEXT",
        reason: "viewport-reset:" + reason,
        epoch: CANVAS_TEXT.epoch,
        viewportSignature: CANVAS_TEXT.viewportSignature,
        requestedAt: Number(options.requestedAt) || 0,
        latestItemAt: 0,
        chunks: []
      }, "*");
    } catch (_) {}
  }

  function parseFontPx(font) {
    const match = String(font || "").match(/(\d+(?:\.\d+)?)px/u);
    return match ? Math.max(6, Number(match[1]) || 16) : 16;
  }

  function normalizeGoogleDocsDrawnText(value) {
    return String(value || "")
      .replace(/[\u200b\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function textFromCanvasPoint(ctx, x, y) {
    try {
      const transform = ctx.getTransform?.();
      if (!transform) return { x, y, scaleX: 1, scaleY: 1 };
      return {
        x: transform.a * x + transform.c * y + transform.e,
        y: transform.b * x + transform.d * y + transform.f,
        scaleX: Math.max(0.05, Math.hypot(transform.a || 0, transform.b || 0) || 1),
        scaleY: Math.max(0.05, Math.hypot(transform.c || 0, transform.d || 0) || Math.abs(transform.d || transform.a || 1))
      };
    } catch (_) {
      return { x, y, scaleX: 1, scaleY: 1 };
    }
  }

  function captureCanvasText(ctx, value, x, y) {
    try {
      const text = normalizeGoogleDocsDrawnText(value);
      if (text.length < 2 || text.length > 700) return;
      if (!/[\p{L}\p{N}]/u.test(text)) return;

      const canvas = ctx?.canvas;
      if (!canvas?.getBoundingClientRect) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      if (rect.bottom < -180 || rect.top > window.innerHeight + 180) return;
      if (rect.right < -80 || rect.left > window.innerWidth + 80) return;

      const point = textFromCanvasPoint(ctx, Number(x) || 0, Number(y) || 0);
      const cssScaleX = rect.width / Math.max(1, canvas.width || rect.width);
      const cssScaleY = rect.height / Math.max(1, canvas.height || rect.height);
      const fontPx = parseFontPx(ctx.font);
      const measured = ctx.measureText ? ctx.measureText(text).width : text.length * fontPx * 0.55;
      const left = rect.left + point.x * cssScaleX;
      const baseline = rect.top + point.y * cssScaleY;
      const height = Math.max(8, fontPx * point.scaleY * cssScaleY * 1.25);
      const width = Math.max(4, measured * point.scaleX * cssScaleX);
      const top = baseline - height * 0.82;

      if (!Number.isFinite(left) || !Number.isFinite(top) || !Number.isFinite(width) || !Number.isFinite(height)) return;
      if (top > window.innerHeight + 180 || top + height < -180) return;

      CANVAS_TEXT.items.push({
        source: "canvas-draw",
        epoch: CANVAS_TEXT.epoch,
        text,
        left,
        top,
        width,
        height,
        font: ctx.font || "",
        fontPx,
        measuredWidth: measured,
        cssScaleX,
        cssScaleY,
        baseline,
        canvasWidth: canvas.width || 0,
        canvasHeight: canvas.height || 0,
        at: Date.now()
      });

      if (CANVAS_TEXT.items.length > CANVAS_TEXT.maxItems) {
        CANVAS_TEXT.items.splice(0, CANVAS_TEXT.items.length - CANVAS_TEXT.maxItems);
      }
      scheduleCanvasTextPost();
    } catch (_) {}
  }

  function compactCanvasTextItems() {
    const now = Date.now();
    const recent = CANVAS_TEXT.items.filter(item =>
      item.epoch === CANVAS_TEXT.epoch &&
      now - (item.at || 0) < 2500
    );
    const seen = new Set();
    const compact = [];
    for (let i = recent.length - 1; i >= 0; i -= 1) {
      const item = recent[i];
      const key = `${Math.round(item.left)}:${Math.round(item.top)}:${item.text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      compact.push(item);
      if (compact.length >= 900) break;
    }
    compact.reverse();
    CANVAS_TEXT.items = recent.slice(-CANVAS_TEXT.maxItems);
    return compact;
  }

  function postCanvasTextSnapshot(reason = "draw", requestMeta = {}) {
    try {
      const now = Date.now();
      CANVAS_TEXT.lastPostAt = now;
      if (reason === "draw") CANVAS_TEXT.lastDrawPostAt = now;
      const chunks = compactCanvasTextItems();
      const latestItemAt = chunks.reduce((max, item) => Math.max(max, Number(item.at) || 0), 0);
      window.postMessage({
        source: "corrector-local",
        type: "CL_GDOCS_CANVAS_TEXT",
        reason,
        epoch: CANVAS_TEXT.epoch,
        viewportSignature: String(requestMeta.viewportSignature || CANVAS_TEXT.viewportSignature || ""),
        requestedAt: Number(requestMeta.requestedAt) || 0,
        latestItemAt,
        chunks
      }, "*");
    } catch (_) {}
  }

  function scheduleCanvasTextPost() {
    const now = Date.now();
    if (CANVAS_TEXT.scheduled || now - CANVAS_TEXT.lastDrawPostAt < 90) return;
    CANVAS_TEXT.scheduled = window.requestAnimationFrame?.(() => {
      CANVAS_TEXT.scheduled = 0;
      postCanvasTextSnapshot("draw");
    }) || window.setTimeout(() => {
      CANVAS_TEXT.scheduled = 0;
      postCanvasTextSnapshot("draw");
    }, 16);
  }

  function patchCanvasPrototype(proto) {
    if (!proto || proto.__correctorLocalCanvasTextPatched) return;
    proto.__correctorLocalCanvasTextPatched = true;

    for (const method of ["fillText", "strokeText"]) {
      const original = proto[method];
      if (typeof original !== "function") continue;
      proto[method] = function patchedCanvasText(text, x, y, maxWidth) {
        captureCanvasText(this, text, x, y);
        return original.call(this, text, x, y, maxWidth);
      };
    }

    const originalMoveTo = proto.moveTo;
    if (typeof originalMoveTo === "function") {
      proto.moveTo = function patchedMoveTo(x, y) {
        LAST_MOVE_TO.set(this, { x, y });
        return originalMoveTo.apply(this, arguments);
      };
    }

    const originalLineTo = proto.lineTo;
    if (typeof originalLineTo === "function") {
      proto.lineTo = function patchedLineTo(x, y) {
        const start = LAST_MOVE_TO.get(this);
        LAST_MOVE_TO.set(this, { x, y });
        const stroke = String(this.strokeStyle || "").toLowerCase();
        if (GOOGLE_NATIVE_LINE_COLORS.has(stroke) && shouldSuppressGoogleNativeMarks()) return;
        if (start && start.y === y && LT_TRANSPARENT_UNDERLINE_COLOR.test(String(this.strokeStyle || ""))) {
          const rect = getCanvasLineRect(this, start.x, start.y, x, y);
          if (rect) {
            const canvas = this.canvas;
            const lines = CANVAS_LINES.get(canvas) || [];
            lines.push(rect);
            CANVAS_LINES.set(canvas, lines.slice(-400));
            try {
              canvas?.dispatchEvent?.(new CustomEvent("cl-strikethroughchange", {
                bubbles: true,
                detail: CANVAS_LINES.get(canvas) || []
              }));
              canvas?.dispatchEvent?.(new CustomEvent("lt-strikethroughchange", {
                bubbles: true,
                detail: CANVAS_LINES.get(canvas) || []
              }));
            } catch (_) {}
          }
        }
        return originalLineTo.apply(this, arguments);
      };
    }

    const originalFillRect = proto.fillRect;
    if (typeof originalFillRect === "function") {
      proto.fillRect = function patchedFillRect() {
        const fill = String(this.fillStyle || "").toLowerCase();
        if (GOOGLE_NATIVE_FILL_COLORS.has(fill) && shouldSuppressGoogleNativeMarks()) return;
        return originalFillRect.apply(this, arguments);
      };
    }

    const originalClearRect = proto.clearRect;
    if (typeof originalClearRect === "function") {
      proto.clearRect = function patchedClearRect(x, y, width, height) {
        const canvas = this.canvas;
        const lines = CANVAS_LINES.get(canvas);
        if (lines?.length) {
          const cleared = getCanvasRect(this, x, y, width, height);
          if (cleared) {
            const remaining = lines.filter(line => !canvasRectsOverlap(line, cleared));
            if (remaining.length !== lines.length) {
              CANVAS_LINES.set(canvas, remaining);
              dispatchCanvasLineChange(canvas, remaining);
            }
          }
        }
        return originalClearRect.apply(this, arguments);
      };
    }

    const originalStroke = proto.stroke;
    if (typeof originalStroke === "function") {
      proto.stroke = function patchedStroke(path) {
        const stroke = String(this.strokeStyle || "").toLowerCase();
        if (path && GOOGLE_NATIVE_LINE_COLORS.has(stroke) && shouldSuppressGoogleNativeMarks()) return;
        return originalStroke.apply(this, arguments);
      };
    }
  }

  function getCanvasLineRect(ctx, x1, y1, x2, y2) {
    try {
      const transform = ctx.getTransform?.();
      if (!transform) return null;
      const p1 = {
        x: transform.a * x1 + transform.c * y1 + transform.e,
        y: transform.b * x1 + transform.d * y1 + transform.f
      };
      const p2 = {
        x: transform.a * x2 + transform.c * y2 + transform.e,
        y: transform.b * x2 + transform.d * y2 + transform.f
      };
      const left = Math.min(p1.x, p2.x);
      const right = Math.max(p1.x, p2.x);
      const centerY = p1.y;
      const half = Math.max(.5, (Number(ctx.lineWidth) || 1) * Math.abs(transform.d) / 2);
      return {
        left,
        right,
        top: centerY - half,
        bottom: centerY + half,
        width: Math.max(0, right - left),
        height: half * 2
      };
    } catch (_) {
      return null;
    }
  }

  function getCanvasRect(ctx, x, y, width, height) {
    try {
      const transform = ctx.getTransform?.();
      if (!transform) return null;
      const points = [[x,y],[x+width,y],[x,y+height],[x+width,y+height]].map(([px,py]) => ({
        x:transform.a*px+transform.c*py+transform.e, y:transform.b*px+transform.d*py+transform.f }));
      const left = Math.min(...points.map(point => point.x)), right = Math.max(...points.map(point => point.x));
      const top = Math.min(...points.map(point => point.y)), bottom = Math.max(...points.map(point => point.y));
      return { left, top, right, bottom };
    } catch (_) {
      return null;
    }
  }

  function canvasRectsOverlap(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function dispatchCanvasLineChange(canvas, lines) {
    try {
      canvas?.dispatchEvent?.(new CustomEvent("cl-strikethroughchange", { detail: lines || [], bubbles: true }));
      canvas?.dispatchEvent?.(new CustomEvent("lt-strikethroughchange", { detail: lines || [], bubbles: true }));
    } catch (_) {}
  }

  function getAnnotatedDocumentText(editRevision = null) {
    const revision = Number.isInteger(Number(editRevision)) ? Number(editRevision) : null;
    if (annotatedTextCache?.revision === revision && Date.now() - annotatedTextCache.at <= 300) {
      return Promise.resolve(annotatedTextCache.result);
    }
    if (annotatedTextPending?.revision === revision) return annotatedTextPending.promise;
    const promise = (async () => {
      try {
        if (typeof self._docs_annotate_getAnnotatedText === "function") {
          const annotated = await retryWithTimeout(
            () => Promise.resolve(self._docs_annotate_getAnnotatedText(extensionId)),
            3,
            400
          );
          if (annotated && typeof annotated.getText === "function") {
            return { text: String(await Promise.resolve(annotated.getText()) || ""), sourceKind: "annotated-api" };
          }
        }
      } catch (_) {}
      return { text: extractTextFromKixApp(self.KX_kixApp), sourceKind: "kix-fallback" };
    })();
    const pending = { revision, promise };
    annotatedTextPending = pending;
    const clearPending = () => {
      if (annotatedTextPending === pending) annotatedTextPending = null;
    };
    promise.then(result => {
      annotatedTextCache = { revision, result, at: Date.now() };
      clearPending();
    }, clearPending);
    return promise;
  }

  async function getAnnotatedDocumentSelection() {
    try {
      if (typeof self._docs_annotate_getAnnotatedText !== "function") return null;
      const annotated = await retryWithTimeout(
        () => Promise.resolve(self._docs_annotate_getAnnotatedText(extensionId)),
        3,
        400
      );
      if (!annotated || typeof annotated.getSelection !== "function") return null;
      const [ranges, text] = await Promise.all([
        Promise.resolve(annotated.getSelection()),
        typeof annotated.getText === "function" ? Promise.resolve(annotated.getText()) : Promise.resolve("")
      ]);
      if (!Array.isArray(ranges)) return null;
      return {
        text: String(text || ""),
        ranges: ranges
          .filter(range => Number.isInteger(range?.start) && Number.isInteger(range?.end) && range.end >= range.start)
          .map(range => ({ start: range.start, end: range.end }))
      };
    } catch (_) {
      return null;
    }
  }

  async function retryWithTimeout(factory, attempts, timeoutMs) {
    let lastError;
    for (let i = 0; i < attempts; i += 1) {
      try {
        return await Promise.race([
          factory(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs))
        ]);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("unavailable");
  }

  function extractTextFromKixApp(kixApp) {
    if (!kixApp) return "";
    const cached = readCachedKixTextPath();
    if (cached) return cached;
    const queue = [[kixApp, []]];
    const seen = new Set([kixApp]);
    while (queue.length) {
      const [obj, path] = queue.shift();
      if (!obj || path.length > 20) continue;
      let keys = [];
      try { keys = Object.getOwnPropertyNames(obj); } catch (_) { continue; }
      for (const key of keys) {
        let value;
        try { value = obj[key]; } catch (_) { continue; }
        if (typeof value === "string" && value.startsWith("\u0003")) {
          cachedKixTextPath = path.concat(key);
          return value;
        }
        if (value && typeof value === "object" && !(value instanceof Node) && !seen.has(value)) {
          seen.add(value);
          queue.push([value, path.concat(key)]);
        }
      }
    }
    return "";
  }

  function readCachedKixTextPath() {
    if (!cachedKixTextPath?.length) return "";
    let obj = self.KX_kixApp;
    try {
      for (const key of cachedKixTextPath) obj = obj[key];
      return typeof obj === "string" && obj.startsWith("\u0003") ? obj : "";
    } catch (_) {
      cachedKixTextPath = null;
      return "";
    }
  }

  try {
    patchCanvasPrototype(window.CanvasRenderingContext2D?.prototype);
    patchCanvasPrototype(window.OffscreenCanvasRenderingContext2D?.prototype);
  } catch (_) {}

  window.addEventListener("message", event => {
    if (event?.source !== window) return;
    if (event.data?.source !== "corrector-local") return;
    if (event.data?.type === "CL_GDOCS_NATIVE_MARK_SUPPRESSION") {
      suppressGoogleNativeMarks = event.data.enabled === true;
      return;
    }
    if (event.data?.type === "CL_GDOCS_REQUEST_LINE_STATE") {
      for (const canvas of document.querySelectorAll("canvas.kix-canvas-tile-content")) dispatchCanvasLineChange(canvas, CANVAS_LINES.get(canvas) || []);
      return;
    }
    if (event.data?.type === "CL_GDOCS_RESET_CANVAS_TEXT") {
      clearCanvasTextForViewportMove(event.data.reason || "content-reset", {
        epoch: event.data.epoch,
        viewportSignature: event.data.viewportSignature,
        requestedAt: event.data.requestedAt
      });
      return;
    }
    if (event.data?.type === "CL_GDOCS_REQUEST_CANVAS_TEXT") {
      const requestedEpoch = Number(event.data.epoch);
      if (Number.isFinite(requestedEpoch) && requestedEpoch !== CANVAS_TEXT.epoch) {
        clearCanvasTextForViewportMove("request-epoch", {
          epoch: requestedEpoch,
          viewportSignature: event.data.viewportSignature,
          requestedAt: event.data.requestedAt
        });
      }
      postCanvasTextSnapshot("request", {
        viewportSignature: event.data.viewportSignature,
        requestedAt: event.data.requestedAt
      });
      return;
    }
    if (event.data?.type === "CL_GDOCS_REQUEST_ANNOTATED_TEXT") {
      const requestId = String(event.data.requestId || "");
      const editRevision = Number(event.data.editRevision);
      getAnnotatedDocumentText(editRevision).then(result => {
        try {
          window.postMessage({
            source: "corrector-local",
            type: "CL_GDOCS_ANNOTATED_TEXT",
            requestId,
            editRevision,
            text: result.text || "",
            sourceKind: result.sourceKind || ""
          }, "*");
        } catch (_) {}
      });
      return;
    }
    if (event.data?.type === "CL_GDOCS_REQUEST_ANNOTATED_SELECTION") {
      getAnnotatedDocumentSelection().then(selection => {
        try {
          window.postMessage({
            source: "corrector-local",
            type: "CL_GDOCS_ANNOTATED_SELECTION",
            requestId: event.data.requestId || "",
            selection
          }, "*");
        } catch (_) {}
      });
    }
  });

  document.addEventListener("corrector-local-get-text", event => {
    const propName = event.detail?.propName;
    if (!propName) return;
    const editRevision = Number(event.detail?.editRevision);
    getAnnotatedDocumentText(editRevision).then(result => {
      try {
        document.body.dataset[propName] = result.text || "";
        document.dispatchEvent(new CustomEvent("corrector-local-text-ready", {
          detail: { propName, editRevision, sourceKind: result.sourceKind || "" }
        }));
      } catch (_) {}
    });
  });
})();
