/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
(() => {
  if (window.__correctorLocalGSlidesLoaded) return;
  window.__correctorLocalGSlidesLoaded = true;

  const SKETCHY_TEXT_MARKER = /^\u0003\uE904?\n+$/;
  const MAX_APP_NODES = 12000;
  const BRIDGE_REVISION = "gslides-discovery-object-traversal-20261029-2";
  const SKIPPED_CLASS_NAMES = new Set([
    "Attr", "Bluetooth", "Clipboard", "Crypto", "CSSStyleDeclaration", "DataView", "DOMStringList", "DOMStringMap",
    "DOMTokenList", "External", "Geolocation", "History", "HTMLCollection", "HTMLDocument", "HTMLBodyElement",
    "HTMLDivElement", "HTMLSpanElement", "IDBDatabase", "IDBFactory", "Ink", "Keyboard", "Location", "MessagePort",
    "NamedNodeMap", "Navigation", "Navigator", "NodeList", "Object", "Performance", "PerformanceTiming", "Permissions",
    "Plugin", "Presentation", "Promise", "Scheduler", "Scheduling", "Screen", "Serial", "ServiceWorker",
    "ServiceWorkerContainer", "Storage", "StylePropertyMap", "SVGAnimatedLength", "SVGAnimatedPreserveAspectRatio",
    "SVGAnimatedRect", "SVGAnimatedString", "SVGLength", "SVGPoint", "SVGPreserveAspectRatio", "SVGRect", "SVGStringList",
    "SVGSVGElement", "TrustedHTML", "TrustedScriptURL", "Uint8Array", "Window", "XMLHttpRequest", "XMLHttpRequestUpload"
  ]);
  const SKIPPED_PROPERTY_NAMES = new Set([
    "$$class/0", "context", "counter", "cursor", "experimentIds", "head", "itemIds", "menu", "n:slide", "next", "offset",
    "parent", "promise", "resourceKeys", "size", "storage", "timing", "token", "transform", "value"
  ]);
  let cachedSlideTextPath = null;
  let lastSlideTextScan = { reason: "not-run" };

  function isObject(value) {
    return !!value && typeof value === "object";
  }

  function readPath(root, path) {
    let node = root;
    for (const key of path || []) node = node?.[key];
    return node;
  }

  function findSlideTextParts() {
    const startedAt = performance.now();
    const selectedSlide = getSelectedSlideIndex();
    if (selectedSlide < 0) {
      lastSlideTextScan = { selectedSlide, reason: "selected-slide-not-found", durationMs: Math.round(performance.now() - startedAt) };
      return [];
    }
    const deadline = performance.now() + 50;
    const cached = cachedSlideTextPath ? readPath(window, cachedSlideTextPath) : null;
    const cachedParts = extractSlideTextParts(cached, selectedSlide, deadline);
    if (cachedParts.length) {
      lastSlideTextScan = { selectedSlide, source: "cached-model-path", visitedNodes: 0,
        partCount: cachedParts.length, charCount: cachedParts.reduce((sum, part) => sum + part.length, 0),
        durationMs: Math.round(performance.now() - startedAt) };
      return cachedParts;
    }
    cachedSlideTextPath = null;
    const root = window.SK_app;
    if (!isObject(root)) {
      lastSlideTextScan = { selectedSlide, reason: "sk-app-unavailable", durationMs: Math.round(performance.now() - startedAt) };
      return [];
    }
    // Slides keeps parts of its live model on non-enumerable own properties.
    // Object.keys() silently skipped those branches, leaving visitedNodes at 0.
    // Walk own properties breadth-first (as the older reader did), but accept
    // only a structured collection containing the currently selected slide.
    const queue = [{ node: root, path: ["SK_app"], depth: 0 }];
    const seen = new Set([root]);
    let visited = 0, cursor = 0;
    let maxDepth = 0;
    while (cursor < queue.length) {
      if (performance.now() > deadline) {
        lastSlideTextScan = { selectedSlide, reason: "scan-deadline", visitedNodes: visited, maxDepth,
          durationMs: Math.round(performance.now() - startedAt) };
        return [];
      }
      if (++visited > MAX_APP_NODES) {
        lastSlideTextScan = { selectedSlide, reason: "node-limit", visitedNodes: visited, maxDepth,
          durationMs: Math.round(performance.now() - startedAt) };
        return [];
      }
      const { node, path, depth } = queue[cursor++];
      maxDepth = Math.max(maxDepth, depth);
      if (Array.isArray(node) && isSlideCollection(node, selectedSlide, deadline)) {
        // Validate and extract the selected slide only. This avoids walking
        // every slide in a large deck while preserving all text on this slide.
        const parts = extractSlideTextParts(node, selectedSlide, deadline);
        if (performance.now() > deadline) {
          lastSlideTextScan = { selectedSlide, reason: "scan-deadline", visitedNodes: visited, maxDepth,
            durationMs: Math.round(performance.now() - startedAt) };
          return [];
        }
        if (parts.length) {
          cachedSlideTextPath = path;
          lastSlideTextScan = { selectedSlide, source: "selected-slide-model", visitedNodes: visited, maxDepth,
            partCount: parts.length, charCount: parts.reduce((sum, part) => sum + part.length, 0),
            durationMs: Math.round(performance.now() - startedAt) };
          return parts;
        }
      }
      if (!isObject(node) || depth >= 8) continue;
      let keys;
      try { keys = Object.getOwnPropertyNames(node); } catch (_) { continue; }
      for (const key of keys) {
        let value;
        try { value = node[key]; } catch (_) { continue; }
        if (!isObject(value) || seen.has(value)) continue;
        // Discovery must traverse plain objects and slide records. The text
        // extraction filter intentionally excludes those and cannot be reused
        // here, before the slide collection has even been located.
        let constructorName;
        try { constructorName = value.constructor?.name; } catch (_) { continue; }
        if (value instanceof Window || value instanceof Node
          || (constructorName !== "Object" && SKIPPED_CLASS_NAMES.has(constructorName))) continue;
        if (queue.length >= MAX_APP_NODES) continue;
        seen.add(value);
        queue.push({ node: value, path: [...path, key], depth: depth + 1 });
      }
    }
    lastSlideTextScan = { selectedSlide, reason: "slide-model-not-found", visitedNodes: visited, maxDepth,
      durationMs: Math.round(performance.now() - startedAt) };
    return [];
  }

  function getSelectedSlideIndex() {
    const border = document.querySelector("g.punch-filmstrip-thumbnail rect.punch-filmstrip-thumbnail-border[style*='stroke']");
    const thumbnail = border?.closest("g.punch-filmstrip-thumbnail");
    const pageNumber = thumbnail?.querySelector("text.punch-filmstrip-thumbnail-pagenumber")?.textContent;
    return /^\d+$/u.test(pageNumber || "") ? Number(pageNumber) - 1 : -1;
  }

  function isObjectNode(value) {
    return isObject(value) && !Array.isArray(value);
  }

  function hasNativeTransform(value) {
    try {
      return isObject(value?.transform) && value.transform.constructor?.name !== "Object";
    } catch (_) { return false; }
  }

  function isStructuredSlideRecord(value, depth = 0) {
    if (!isObjectNode(value) || depth > 4) return false;
    let constructorName;
    let keys;
    try {
      constructorName = value.constructor?.name;
      keys = Object.keys(value);
    } catch (_) { return false; }
    if (!constructorName || constructorName === "Object" || Object.prototype.hasOwnProperty.call(value, "properties") || !hasNativeTransform(value)) return false;
    for (const key of keys) {
      let child;
      try { child = value[key]; } catch (_) { continue; }
      if (!isObjectNode(child)) continue;
      let childKeys;
      try {
        if (child.constructor?.name !== "Object") continue;
        childKeys = Object.getOwnPropertyNames(child);
      } catch (_) { continue; }
      if (childKeys.length && childKeys.every(name => /^[A-Z][A-Z0-9_]*$/u.test(name)
        && isObject(child[name]))) return false;
    }
    return keys.some(key => {
      let child;
      try { child = value[key]; } catch (_) { return false; }
      if (!Array.isArray(child) || !child.length) return false;
      return child.every(entry => isStructuredSlideEntry(entry, depth + 1));
    });
  }

  function isStructuredSlideEntry(value, depth) {
    if (!isObjectNode(value) || depth > 6) return false;
    try {
      if (Object.prototype.hasOwnProperty.call(value, "properties")
        && value.constructor?.name !== "Object"
        && isObjectNode(value.properties) && value.properties.constructor?.name === "Object"
        && hasNativeTransform(value)) return true;
      if (value.constructor?.name === "Object"
        || Object.prototype.hasOwnProperty.call(value, "properties") || !hasNativeTransform(value)) return false;
      return Object.keys(value).some(key => {
        let child;
        try { child = value[key]; } catch (_) { return false; }
        return Array.isArray(child) && child.length > 0
          && child.every(entry => isStructuredSlideEntry(entry, depth + 1));
      });
    } catch (_) { return false; }
  }

  function isSlideCollection(value, selectedSlide, deadline = Number.POSITIVE_INFINITY) {
    if (!Array.isArray(value) || !value.length || selectedSlide < 0 || selectedSlide >= value.length) return false;
    try {
      return performance.now() <= deadline && isStructuredSlideRecord(value[selectedSlide]);
    } catch (_) { return false; }
  }

  function isSlideTextPart(value) {
    if (!isObjectNode(value)) return false;
    let keys;
    try { keys = Object.getOwnPropertyNames(value); } catch (_) { return false; }
    if (keys.length !== 4) return false;
    let objectFields = 0;
    let textFields = 0;
    for (const key of keys) {
      let field;
      try { field = value[key]; } catch (_) { return false; }
      if (isObjectNode(field)) objectFields++;
      else if (typeof field === "string" && field.startsWith("\u0003") && field.endsWith("\n")) textFields++;
      else return false;
    }
    return objectFields === 3 && textFields === 1;
  }

  function isSkippedSlideNode(value, propertyName) {
    if (!isObject(value)) return true;
    try {
      if (value instanceof Window || value instanceof Node || value instanceof Map || value instanceof Set
        || value instanceof Date || value instanceof RegExp || SKIPPED_CLASS_NAMES.has(value.constructor?.name)
        || SKIPPED_PROPERTY_NAMES.has(propertyName) || isStructuredSlideRecord(value)) return true;
      for (const key in value) {
        let nested;
        try { nested = value[key]; } catch (_) { continue; }
        if (typeof nested === "string" && nested.includes("presentation")) return true;
      }
    } catch (_) { return true; }
    return false;
  }

  function extractSlideTextParts(slides, selectedSlide, deadline = Number.POSITIVE_INFINITY) {
    const slide = Array.isArray(slides) ? slides[selectedSlide] : null;
    if (!isObjectNode(slide)) return [];
    const queue = [slide];
    const seen = new WeakSet([slide]);
    const parts = [];
    let cursor = 0;
    while (cursor < queue.length && cursor < MAX_APP_NODES) {
      if (performance.now() > deadline) return [];
      const node = queue[cursor++];
      if (!isObject(node)) continue;
      let keys;
      try { keys = Object.getOwnPropertyNames(node); } catch (_) { continue; }
      for (const key of keys) {
        let value;
        try { value = node[key]; } catch (_) { continue; }
        if (!isObject(value) || seen.has(value)) continue;
        if (isSkippedSlideNode(value, key)) continue;
        seen.add(value);
        if (isSlideTextPart(value)) {
          for (const field of Object.values(value)) {
            if (typeof field === "string" && !SKETCHY_TEXT_MARKER.test(field)) parts.push(field);
          }
          continue;
        }
        if (queue.length >= MAX_APP_NODES) return [];
        queue.push(value);
      }
    }
    return cursor < queue.length ? [] : parts;
  }

  function handleSlideTextPartsRequest(event) {
    const propName = event.detail?.propName || event.detail?.datasetPropName;
    if (!propName) return;
    try {
      const parts = findSlideTextParts();
      document.body.dataset[propName] = JSON.stringify(parts);
      document.body.dataset[`${propName}Diagnostics`] = JSON.stringify(lastSlideTextScan);
      document.dispatchEvent(new CustomEvent("corrector-local-slide-text-parts-ready", {
        detail: { propName }
      }));
    } catch (_) {}
  }

  document.addEventListener("corrector-local-get-slide-text-parts", handleSlideTextPartsRequest);

  document.documentElement?.setAttribute("data-corrector-local-gslides-bridge-ready", "true");
  document.documentElement?.setAttribute("data-corrector-local-gslides-bridge-revision", BRIDGE_REVISION);
  try {
    window.postMessage({
      source: "corrector-local",
      type: "CL_GSLIDES_MAIN_LOADED"
    }, "*");
  } catch (_) {}
})();
