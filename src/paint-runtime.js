/* Local implementation of the painting contracts observed in LanguageTool
 * Browser 11.4: sibling host, clipped viewport, content coordinate boxes,
 * independently scrolling layer, retained canvas tiles, and shared hit boxes.
 * No LanguageTool bundle is executed and no document text leaves the page. */
(() => {
  if (globalThis.CorrectorPaintRuntime) return;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const TILE_SIZE = 1024;
  const number = value => Number.parseFloat(value) || 0;
  const set = (el, values) => { for (const [key, value] of Object.entries(values)) el.style.setProperty(key, String(value), "important"); };
  const rect = (left, top, right, bottom) => ({ left, top, right, bottom, width: right - left, height: bottom - top });

  class PaintLayer {
    constructor(target, options = {}) {
      this.target = target;
      this.options = options;
      this.document = target.ownerDocument;
      this.tiles = new Map();
      this.domMarks = new Map();
      this.items = [];
      this.metrics = { layoutUpdates: 0, paints: 0, tilePaints: 0, scrollTransports: 0, geometryInvalidations: 0 };
      this.host = this.document.createElement("div");
      this.host.className = "corrector-local-paint-host";
      this.host.dataset.correctorPaintMode = options.mode || "editor";
      this.host.setAttribute("spellcheck", "false");
      this.host.setAttribute("aria-hidden", "false");
      if (target.hasAttribute("slot")) this.host.setAttribute("slot", target.getAttribute("slot"));
      set(this.host, { position: "absolute", width: "1px", height: "1px", margin: 0, padding: 0,
        border: 0, "pointer-events": "none", overflow: "visible", transform: "none", zoom: 1,
        "z-index": options.zIndex ?? (number(getComputedStyle(target).zIndex) + 1) });
      this.shadow = this.host.attachShadow({ mode: "closed" });
      const style = this.document.createElement("style");
      style.textContent = `:host{all:initial} .viewport{position:absolute;overflow:hidden;pointer-events:none;transform-origin:0 0}
        .content{position:absolute;pointer-events:none;overflow:visible} canvas{position:absolute;pointer-events:none;display:block}
        .paint-mark{position:absolute;pointer-events:none;box-sizing:border-box}
        .hits{position:absolute;left:0;top:0;pointer-events:none;overflow:visible}
        button{position:absolute!important;display:block!important;box-sizing:border-box!important;border:0!important;
          padding:0!important;margin:0!important;background:transparent!important;box-shadow:none!important;
          border-radius:0!important;min-width:0!important;min-height:0!important;pointer-events:auto!important;cursor:pointer!important}
        .scrolling button{pointer-events:none!important} button svg{display:none!important}`;
      this.viewport = this.document.createElement("div");
      this.viewport.className = "viewport";
      this.content = this.document.createElement("div");
      this.content.className = "content";
      this.buttons = this.document.createElement("div");
      this.buttons.className = "hits";
      this.content.append(this.buttons);
      this.viewport.append(this.content);
      this.shadow.append(style, this.viewport);
      target.parentNode.insertBefore(this.host, target);
      this.syncLayout();
      this.onScroll = () => {
        this.syncScroll();
        this.viewport.classList.add("scrolling");
        this.isScrolling = true;
        clearTimeout(this.scrollEnd);
        this.scrollEnd = setTimeout(() => { this.isScrolling = false; this.viewport.classList.remove("scrolling"); }, 100);
      };
      target.addEventListener("scroll", this.onScroll, { passive: true });
      this.resizeObserver = new ResizeObserver(() => this.invalidateGeometry("resize"));
      this.resizeObserver.observe(target);
      this.observer = new MutationObserver(records => {
        if (options.mode === "docs-pageless" && isDocsScrollMutation(records)) return;
        this.invalidateGeometry("mutation", records);
      });
      this.observer.observe(target, { childList: true, subtree: true, characterData: true, attributes: true,
        attributeFilter: ["style", "class", "slot", "transform", "width", "height", "x", "y", "aria-label", "data-font-css"] });
    }

    invalidateGeometry(reason, records = []) {
      if (this.destroyed || this.frame) return;
      this.metrics.geometryInvalidations++;
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        if (!this.target.isConnected) { this.destroy(); this.options.onDetach?.(this); return; }
        this.syncLayout();
        this.options.onGeometryChange?.(this, reason, records);
      });
    }

    syncLayout() {
      if (this.destroyed || !this.target.isConnected) return false;
      if (this.host.parentNode !== this.target.parentNode || this.host.nextSibling !== this.target) {
        this.target.parentNode.insertBefore(this.host, this.target);
      }
      const box = this.target.getBoundingClientRect();
      if (!box.width || !box.height) { this.viewport.style.visibility = "hidden"; return false; }
      this.viewport.style.visibility = "";
      const parent = this.host.getBoundingClientRect();
      const parentScaleX = parent.width || 1, parentScaleY = parent.height || 1;
      this.scaleX = box.width / (this.target.offsetWidth || box.width);
      this.scaleY = box.height / (this.target.offsetHeight || box.height);
      this.borderLeft = this.target.clientLeft || 0;
      this.borderTop = this.target.clientTop || 0;
      this.width = this.target.clientWidth || box.width / this.scaleX;
      this.height = this.target.clientHeight || box.height / this.scaleY;
      this.contentWidth = Math.max(this.width, this.target.scrollWidth || 0);
      this.contentHeight = Math.max(this.height, this.target.scrollHeight || 0);
      this.screenBox = rect(box.left + this.borderLeft * this.scaleX, box.top + this.borderTop * this.scaleY,
        box.left + (this.borderLeft + this.width) * this.scaleX, box.top + (this.borderTop + this.height) * this.scaleY);
      set(this.viewport, { left: (this.screenBox.left - parent.left) / parentScaleX + "px",
        top: (this.screenBox.top - parent.top) / parentScaleY + "px", width: this.width + "px", height: this.height + "px",
        transform: `scale(${this.scaleX / parentScaleX},${this.scaleY / parentScaleY})` });
      set(this.content, { width: this.contentWidth + "px", height: this.contentHeight + "px" });
      this.syncScroll();
      this.metrics.layoutUpdates++;
      return true;
    }

    syncScroll() {
      this.scrollLeft = this.target.scrollLeft || 0;
      this.scrollTop = this.target.scrollTop || 0;
      set(this.content, { left: -this.scrollLeft + "px", top: -this.scrollTop + "px" });
      this.metrics.scrollTransports++;
    }

    toContentRect(screenRect) {
      const box = this.target.getBoundingClientRect();
      const left = box.left + this.borderLeft * this.scaleX;
      const top = box.top + this.borderTop * this.scaleY;
      return rect((screenRect.left - left) / this.scaleX + (this.target.scrollLeft || 0),
        (screenRect.top - top) / this.scaleY + (this.target.scrollTop || 0),
        (screenRect.right - left) / this.scaleX + (this.target.scrollLeft || 0),
        (screenRect.bottom - top) / this.scaleY + (this.target.scrollTop || 0));
    }

    toScreenRect(localRect) {
      const box = this.target.getBoundingClientRect();
      const left = box.left + this.borderLeft * this.scaleX, top = box.top + this.borderTop * this.scaleY;
      return rect(left + (localRect.left - (this.target.scrollLeft || 0)) * this.scaleX,
        top + (localRect.top - (this.target.scrollTop || 0)) * this.scaleY,
        left + (localRect.right - (this.target.scrollLeft || 0)) * this.scaleX,
        top + (localRect.bottom - (this.target.scrollTop || 0)) * this.scaleY);
    }

    positionHit(mark, box) {
      mark.__clPaintLayer = this;
      mark.__clLocalRect = box;
      set(mark, { left: box.left + "px", top: box.top + "px", width: Math.max(1, box.width) + "px", height: Math.max(1, box.height) + "px" });
      if (mark.parentNode !== this.buttons) this.buttons.append(mark);
    }

    setItems(items) {
      this.items = items;
      // Mirror LT's most-specific hit selection. Larger overlapping ranges sit
      // below smaller ones, rather than letting arrival order decide the click.
      const hits = [...this.buttons.children].sort((a,b) => {
        const area = mark => (mark.__clLocalRect?.width || 0) * (mark.__clLocalRect?.height || 0);
        return area(b)-area(a) || ((b.__clIssue?.end || 0)-(b.__clIssue?.start || 0))-((a.__clIssue?.end || 0)-(a.__clIssue?.start || 0));
      });
      for (const hit of hits) this.buttons.append(hit);
      this.redraw();
    }
    redraw() {
      if (this.destroyed) return;
      if (this.options.renderMode === "dom") { this.redrawDomMarks(); return; }
      const groups = new Map();
      for (const item of this.items) {
        const box = item.rect;
        if (!box || box.width < 1 || box.height < 1) continue;
        for (let y = Math.max(0, Math.floor(box.top / TILE_SIZE)); y <= Math.floor((box.bottom + 1) / TILE_SIZE); y++) {
          for (let x = Math.max(0, Math.floor(box.left / TILE_SIZE)); x <= Math.floor((box.right - .001) / TILE_SIZE); x++) {
            const key = `${x}:${y}`;
            const list = groups.get(key) || []; list.push(item); groups.set(key, list);
          }
        }
      }
      for (const [key, items] of groups) this.paintTile(key, items);
      for (const [key, tile] of this.tiles) if (!groups.has(key)) { tile.canvas.remove(); this.tiles.delete(key); }
      this.metrics.paints++;
    }

    redrawDomMarks() {
      const active = new Set();
      for (const item of this.items) {
        const box = item.rect;
        if (!box || box.width < 1 || box.height < 1) continue;
        const key = `${item.issue?.ruleId || ""}:${item.issue?.start ?? ""}:${item.issue?.end ?? ""}:${item.issue?.text || ""}:${box.left}:${box.top}`;
        active.add(key);
        let mark = this.domMarks.get(key);
        if (!mark) {
          mark = this.document.createElement("div");
          mark.className = "paint-mark";
          this.domMarks.set(key, mark);
          this.content.insertBefore(mark, this.buttons);
        }
        const colors = this.options.colors(item.issue);
        set(mark, { left: box.left + "px", top: box.top + "px", width: box.width + "px", height: box.height + "px",
          background: colors.background || "transparent",
          "background-image": `linear-gradient(to bottom, transparent calc(100% - 2px), ${colors.underline} 0)` });
      }
      for (const [key, mark] of this.domMarks) {
        if (active.has(key)) continue;
        mark.remove(); this.domMarks.delete(key);
      }
      this.metrics.paints++;
    }

    paintTile(key, items) {
      const [column, row] = key.split(":").map(Number);
      const cell = rect(column * TILE_SIZE, row * TILE_SIZE, (column + 1) * TILE_SIZE, (row + 1) * TILE_SIZE);
      const bounds = rect(Math.max(cell.left, Math.min(...items.map(i => i.rect.left))),
        Math.max(cell.top, Math.min(...items.map(i => i.rect.top))),
        Math.min(cell.right, Math.max(...items.map(i => i.rect.right))),
        Math.min(cell.bottom, Math.max(...items.map(i => i.rect.bottom + 1))));
      const dpr = Math.max(1, this.document.defaultView.devicePixelRatio || 1);
      const resolutionX = dpr * this.scaleX, resolutionY = dpr * this.scaleY;
      const signature = items.map(item => {
        const colors = this.options.colors(item.issue);
        return `${item.rect.left}:${item.rect.top}:${item.rect.right}:${item.rect.bottom}:${colors.underline}:${colors.background}`;
      }).join("|") + `@${resolutionX}:${resolutionY}`;
      let tile = this.tiles.get(key);
      if (tile?.signature === signature && tile.bounds.left === bounds.left && tile.bounds.top === bounds.top) return;
      if (!tile) {
        const canvas = this.document.createElement("canvas");
        this.content.insertBefore(canvas, this.buttons);
        tile = { canvas }; this.tiles.set(key, tile);
      }
      const canvas = tile.canvas;
      canvas.width = Math.max(1, Math.ceil(bounds.width * resolutionX));
      canvas.height = Math.max(1, Math.ceil(bounds.height * resolutionY));
      set(canvas, { left: bounds.left + "px", top: bounds.top + "px", width: bounds.width + "px", height: bounds.height + "px" });
      const ctx = canvas.getContext("2d");
      ctx.setTransform(resolutionX, 0, 0, resolutionY, 0, 0);
      // Redraw the changed tile once. Repainting translucent whole items over
      // partially cleared dirty regions accumulated opacity in the old path.
      for (const item of items) {
        const color = this.options.colors(item.issue).background;
        if (color) { ctx.fillStyle = color; ctx.fillRect(item.rect.left - bounds.left, item.rect.top - bounds.top,
          item.rect.width, Math.max(0, item.rect.height - 1)); }
      }
      for (const item of items) {
        ctx.fillStyle = this.options.colors(item.issue).underline;
        ctx.fillRect(item.rect.left - bounds.left, item.rect.bottom - bounds.top - 1, item.rect.width, 2);
      }
      tile.signature = signature; tile.bounds = bounds;
      this.metrics.tilePaints++;
    }

    clear() {
      this.items = [];
      for (const tile of this.tiles.values()) tile.canvas.remove();
      this.tiles.clear();
      for (const mark of this.domMarks.values()) mark.remove();
      this.domMarks.clear();
    }
    destroy() {
      if (this.destroyed) return;
      this.destroyed = true; cancelAnimationFrame(this.frame || 0); clearTimeout(this.scrollEnd);
      this.target.removeEventListener("scroll", this.onScroll);
      this.observer.disconnect(); this.resizeObserver.disconnect(); this.clear(); this.host.remove();
    }
  }

  function getDocsTarget(element) {
    if (!element?.closest) return null;
    const page = element.closest(".kix-page-paginated,.kix-page");
    const tile = element.closest("div.kix-canvas-tile-content");
    if (page && tile) return { target: tile, mode: "docs-paginated", zIndex: 750 };
    const editor = element.closest("div.kix-rotatingtilemanager");
    if (editor && !editor.querySelector(".kix-page-paginated")) return { target: editor, mode: "docs-pageless", zIndex: 500 };
    return tile ? { target: tile, mode: "docs-paginated", zIndex: 750 } : null;
  }

  function isDocsScrollMutation(records) {
    if (!records.length || !records[0].target.matches?.("div.kix-rotatingtilemanager-content > div")) return false;
    const target = records[0].target;
    if (target.children.length !== records.length - 1) return false;
    return records.every((record, index) => record.type === "attributes" && record.attributeName === "style"
      && (index === 0 || record.target === target.children[index - 1]));
  }

  function measureSvgRange(part, start, end, measure, layer) {
    const node = part?.el;
    if (node?.namespaceURI !== SVG_NS || !node.getScreenCTM || !node.hasAttribute("data-font-css")) return null;
    const raw = node.getAttribute("aria-label") || part.rawText || part.text || "";
    const font = node.getAttribute("data-font-css");
    const map = part.sourceOffsetMap;
    const rawStart = map?.[start]?.start ?? start;
    const rawEnd = map?.[end - 1]?.end ?? end;
    if (start < 0 || end <= start || end > (part.text || "").length || rawEnd > raw.length) return null;
    const matrix = node.getScreenCTM();
    if (!matrix || matrix.a <= 0 || matrix.d <= 0 || Math.abs(matrix.b) > .015 || Math.abs(matrix.c) > .015) return null;
    const x = number(node.getAttribute("x")), y = number(node.getAttribute("y")), height = number(node.getAttribute("height"));
    if (!height) return null;
    // Measure the original prefix including its trailing spaces. LT measures
    // the selected substring separately; it does not fit advances to rect.width.
    const prefix = measure(font, raw.slice(0, rawStart));
    const selected = measure(font, raw.slice(rawStart, rawEnd));
    const left = matrix.a * x + matrix.c * y + matrix.e + prefix * matrix.a;
    const top = matrix.b * x + matrix.d * y + matrix.f;
    const screen = rect(left, top, left + selected * matrix.a, top + height * matrix.d);
    if (!layer) return { screen, source: "docs-svg-lt-metrics" };
    const local = layer.toContentRect(screen);
    const rounded = rect(Math.round(local.left), Math.round(local.top), Math.round(local.right), Math.round(local.bottom));
    return { screen: layer.toScreenRect(rounded), local: rounded, source: "docs-svg-lt-metrics" };
  }

  globalThis.CorrectorPaintRuntime = Object.freeze({ PaintLayer, getDocsTarget, measureSvgRange, isDocsScrollMutation, TILE_SIZE });
})();
