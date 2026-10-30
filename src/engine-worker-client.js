(() => {
  class CorrectorEngineWorkerClient {
    constructor(options = {}) {
      this.workerUrl = options.workerUrl || "src/engine-worker.js";
      this.timeoutMs = Number(options.timeoutMs || 50000);
      this.poolSize = Math.max(1, Math.min(Number(options.poolSize || 2), 3));
      this.pending = new Map();
      this.sequence = 0;
      this.revision = 0;
      this.workers = new Array(this.poolSize).fill(null);
      this.stats = {
        createdAt: Date.now(),
        poolSize: this.poolSize,
        starts: 0,
        restarts: 0,
        lastWorkerUrl: "",
        requests: 0,
        resolved: 0,
        rejected: 0,
        timeouts: 0,
        staleResponses: 0,
        splitBatchRequests: 0,
        parallelBatchRequests: 0,
        streamedItems: 0,
        cancelledBatches: 0,
        lastTransport: "",
        lastError: "",
        lastRequest: null,
        lastResponse: null,
        slowRequests: [],
        workers: Array.from({ length: this.poolSize }, (_, index) => ({
          index,
          starts: 0,
          restarts: 0,
          pending: 0,
          resolved: 0,
          rejected: 0,
          timeouts: 0,
          staleResponses: 0,
          lastDurationMs: 0,
          maxDurationMs: 0,
          lastType: "",
          lastError: ""
        }))
      };
    }

    getWorkerUrl() {
      if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
        return chrome.runtime.getURL(this.workerUrl);
      }
      return this.workerUrl;
    }

    workerName(index) {
      return `corrector-engine-worker-${index + 1}`;
    }

    ensureWorker(index = 0) {
      const workerIndex = Math.max(0, Math.min(Number(index || 0), this.poolSize - 1));
      if (this.workers[workerIndex]) return this.workers[workerIndex];
      const url = this.getWorkerUrl();
      this.stats.lastWorkerUrl = url;
      const worker = new Worker(url, { type: "classic", name: this.workerName(workerIndex) });
      worker.__clWorkerIndex = workerIndex;
      this.workers[workerIndex] = worker;
      this.stats.starts += 1;
      this.stats.workers[workerIndex].starts += 1;
      worker.onmessage = event => this.handleMessage(event.data || {}, workerIndex);
      worker.onerror = error => {
        const message = String(error?.message || error?.filename || error || "worker error");
        this.stats.lastError = message;
        this.stats.workers[workerIndex].lastError = message;
        this.stats.lastErrorEvent = {
          workerIndex,
          message: String(error?.message || ""),
          filename: String(error?.filename || ""),
          lineno: Number(error?.lineno || 0),
          colno: Number(error?.colno || 0),
          at: Date.now()
        };
        this.rejectWorkerPending(workerIndex, new Error(message));
        this.restart(workerIndex);
      };
      worker.onmessageerror = error => {
        const message = String(error?.message || error || "worker message error");
        this.stats.lastError = message;
        this.stats.workers[workerIndex].lastError = message;
        this.stats.lastMessageErrorAt = Date.now();
      };
      return worker;
    }

    restart(index = null) {
      if (index === null || typeof index === "undefined") {
        for (let workerIndex = 0; workerIndex < this.poolSize; workerIndex += 1) this.restart(workerIndex);
        return;
      }
      const workerIndex = Math.max(0, Math.min(Number(index || 0), this.poolSize - 1));
      if (this.workers[workerIndex]) {
        try { this.workers[workerIndex].terminate(); } catch (_) {}
      }
      this.workers[workerIndex] = null;
      this.stats.restarts += 1;
      this.stats.workers[workerIndex].restarts += 1;
    }

    rejectAll(error) {
      for (const [id, pending] of this.pending.entries()) {
        clearTimeout(pending.timer);
        pending.reject(error);
        this.pending.delete(id);
      }
      this.refreshPendingCounts();
    }

    rejectWorkerPending(workerIndex, error) {
      for (const [id, pending] of this.pending.entries()) {
        if (pending.workerIndex !== workerIndex) continue;
        clearTimeout(pending.timer);
        pending.reject(error);
        this.pending.delete(id);
      }
      this.refreshPendingCounts();
    }

    nextRevision() {
      this.revision += 1;
      return this.revision;
    }

    refreshPendingCounts() {
      for (const item of this.stats.workers) item.pending = 0;
      for (const pending of this.pending.values()) {
        if (this.stats.workers[pending.workerIndex]) this.stats.workers[pending.workerIndex].pending += 1;
      }
    }

    chooseWorkerIndex(preferred = null) {
      if (preferred !== null && typeof preferred !== "undefined") {
        return Math.max(0, Math.min(Number(preferred || 0), this.poolSize - 1));
      }
      this.refreshPendingCounts();
      let best = 0;
      let bestPending = Number.POSITIVE_INFINITY;
      for (let index = 0; index < this.poolSize; index += 1) {
        const pending = Number(this.stats.workers[index]?.pending || 0);
        if (pending < bestPending) {
          best = index;
          bestPending = pending;
        }
      }
      return best;
    }

    rememberSlowRequest(entry) {
      if (!entry || Number(entry.durationMs || 0) < 1500) return;
      this.stats.slowRequests.push({
        at: Date.now(),
        ...entry,
        sample: String(entry.sample || "").slice(0, 260)
      });
      if (this.stats.slowRequests.length > 24) this.stats.slowRequests.shift();
    }

    request(type, payload = {}, options = {}) {
      const workerIndex = this.chooseWorkerIndex(options.workerIndex);
      const worker = this.ensureWorker(workerIndex);
      const id = `cw-${Date.now()}-${++this.sequence}`;
      const timeoutMs = Number(options.timeoutMs || this.timeoutMs);
      const revision = Number(options.revision || payload.revision || this.nextRevision());
      const requestPayload = {
        ...payload,
        revision,
        jobId: payload.jobId || options.jobId || ""
      };
      this.stats.requests += 1;
      this.stats.lastRequest = {
        id,
        type,
        revision,
        jobId: requestPayload.jobId,
        workerIndex,
        at: Date.now()
      };

      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          const pending = this.pending.get(id);
          if (!pending) return;
          this.pending.delete(id);
          this.stats.timeouts += 1;
          this.stats.rejected += 1;
          this.stats.workers[workerIndex].timeouts += 1;
          this.stats.workers[workerIndex].rejected += 1;
          this.refreshPendingCounts();
          this.rememberSlowRequest({
            type,
            workerIndex,
            timeout: true,
            durationMs: Date.now() - pending.startedAt,
            items: Array.isArray(requestPayload.items) ? requestPayload.items.length : undefined,
            chars: this.payloadChars(requestPayload),
            jobId: requestPayload.jobId,
            sample: this.payloadSample(requestPayload)
          });
          reject(new Error(`Timeout del worker (${type})`));
        }, timeoutMs);

        this.pending.set(id, {
          type,
          revision,
          resolve,
          reject,
          timer,
          workerIndex,
          onProgress: typeof options.onProgress === "function" ? options.onProgress : null,
          payload: requestPayload,
          startedAt: Date.now()
        });
        this.refreshPendingCounts();

        try {
          worker.postMessage({ id, type, payload: requestPayload });
        } catch (error) {
          clearTimeout(timer);
          this.pending.delete(id);
          this.stats.rejected += 1;
          this.stats.workers[workerIndex].rejected += 1;
          this.refreshPendingCounts();
          reject(error);
        }
      });
    }

    payloadChars(payload) {
      if (Array.isArray(payload?.items)) return payload.items.reduce((sum, item) => sum + String(item?.text || "").length, 0);
      return String(payload?.text || "").length;
    }

    payloadSample(payload) {
      if (Array.isArray(payload?.items)) return payload.items.map(item => String(item?.text || "").slice(0, 80)).join(" | ");
      return String(payload?.text || "").slice(0, 240);
    }

    handleMessage(message, fallbackWorkerIndex = 0) {
      const id = message.id || "";
      const pending = this.pending.get(id);
      if (!pending) {
        const index = Math.max(0, Math.min(Number(fallbackWorkerIndex || 0), this.poolSize - 1));
        this.stats.staleResponses += 1;
        this.stats.workers[index].staleResponses += 1;
        return;
      }
      if (message.type === "CHECK_BATCH_PROGRESS") {
        this.stats.streamedItems += 1;
        try { pending.onProgress?.(message.result || {}, pending.workerIndex); } catch (_) {}
        return;
      }
      this.pending.delete(id);
      clearTimeout(pending.timer);
      const durationMs = Date.now() - pending.startedAt;
      const workerStats = this.stats.workers[pending.workerIndex];
      if (workerStats) {
        workerStats.pending = Math.max(0, Number(workerStats.pending || 1) - 1);
        workerStats.lastDurationMs = durationMs;
        workerStats.maxDurationMs = Math.max(Number(workerStats.maxDurationMs || 0), durationMs);
        workerStats.lastType = pending.type;
      }
      this.stats.lastResponse = {
        id,
        type: pending.type,
        ok: !!message.ok,
        workerIndex: pending.workerIndex,
        durationMs,
        at: Date.now()
      };
      this.rememberSlowRequest({
        type: pending.type,
        workerIndex: pending.workerIndex,
        durationMs,
        items: Array.isArray(pending.payload?.items) ? pending.payload.items.length : undefined,
        chars: this.payloadChars(pending.payload),
        jobId: pending.payload?.jobId || "",
        resultIssues: this.countResultIssues(message.result),
        sample: this.payloadSample(pending.payload)
      });
      if (!message.ok) {
        this.stats.rejected += 1;
        if (workerStats) workerStats.rejected += 1;
        this.stats.lastError = String(message.error || "worker request failed");
        this.stats.lastFailureStatus = message.status || null;
        pending.reject(new Error(this.stats.lastError));
        return;
      }
      this.stats.resolved += 1;
      if (workerStats) workerStats.resolved += 1;
      this.stats.lastTransport = this.poolSize > 1 ? "engine-worker-pool" : "engine-worker";
      pending.resolve({
        ...(message.result || {}),
        transport: this.stats.lastTransport,
        workerIndex: pending.workerIndex,
        requestDurationMs: durationMs
      });
    }

    countResultIssues(result) {
      if (Array.isArray(result?.issues)) return result.issues.length;
      if (Array.isArray(result?.results)) {
        return result.results.reduce((sum, item) => sum + (Array.isArray(item?.issues) ? item.issues.length : 0), 0);
      }
      return 0;
    }

    preload(language = "ca", options = {}) {
      const primary = this.request("PRELOAD", { language }, { ...options, workerIndex: 0 });
      if (this.poolSize <= 1 || options.primaryOnly) return primary;
      for (let index = 1; index < this.poolSize; index += 1) {
        this.request("PRELOAD", { language }, { ...options, workerIndex: index })
          .catch(error => {
            this.stats.lastError = String(error?.message || error);
          });
      }
      return primary;
    }

    checkText(text, options = {}, meta = {}) {
      return this.request("CHECK_TEXT", {
        text,
        language: options.language || meta.language || "ca",
        options,
        jobId: meta.jobId || ""
      }, meta);
    }

    splitBatchItems(items) {
      const normalized = Array.isArray(items) ? items : [];
      if (this.poolSize <= 1 || normalized.length < 2) return [normalized];
      const lanes = Array.from({ length: Math.min(this.poolSize, normalized.length) }, () => []);
      normalized.forEach((item, index) => lanes[index % lanes.length].push(item));
      return lanes.filter(lane => lane.length);
    }

    checkBatch(items, options = {}, meta = {}) {
      const normalized = Array.isArray(items) ? items : [];
      const lanes = this.splitBatchItems(normalized);
      if (lanes.length <= 1) {
        return this.request("CHECK_BATCH", {
          items: normalized,
          language: options.language || meta.language || "ca",
          options,
          jobId: meta.jobId || "",
          requestId: meta.requestId || "",
          tracePerformance: !!meta.tracePerformance
        }, { ...meta, onProgress: (result, workerIndex) => meta.onItemResult?.(result, workerIndex) });
      }
      const started = Date.now();
      this.stats.splitBatchRequests += 1;
      this.stats.parallelBatchRequests += lanes.length;
      const requests = lanes.map((lane, index) => this.request("CHECK_BATCH", {
        items: lane,
        language: options.language || meta.language || "ca",
        options,
        jobId: meta.jobId || "",
        requestId: meta.requestId || "",
        tracePerformance: !!meta.tracePerformance
      }, { ...meta, workerIndex: index % this.poolSize, onProgress: (result, workerIndex) => meta.onItemResult?.(result, workerIndex) }));
      return Promise.all(requests).then(parts => {
        const resultMap = new Map();
        const pendingIds = [];
        const workerStatuses = [];
        let durationMs = 0;
        let chunkedItems = 0;
        const chunkMetrics = [];
        const itemMetrics = [];
        const engineDiagnostics = [];
        const workerTraces = [];
        for (const part of parts) {
          durationMs = Math.max(durationMs, Number(part.durationMs || part.requestDurationMs || 0));
          chunkedItems += Number(part.chunkedItems || 0);
          if (Array.isArray(part.chunkMetrics)) chunkMetrics.push(...part.chunkMetrics);
          if (Array.isArray(part.itemMetrics)) itemMetrics.push(...part.itemMetrics.map(item => ({ ...item, workerIndex: part.workerIndex })));
          if (part.engineDiagnostics) engineDiagnostics.push({ workerIndex: part.workerIndex, diagnostics: part.engineDiagnostics });
          if (Array.isArray(part.pendingIds)) pendingIds.push(...part.pendingIds);
          if (part.workerStatus) workerStatuses.push({ workerIndex: part.workerIndex, status: part.workerStatus });
          if (part.workerTrace) workerTraces.push({ workerIndex: part.workerIndex, ...part.workerTrace });
          for (const result of Array.isArray(part.results) ? part.results : []) resultMap.set(String(result.id), result);
        }
        const results = normalized
          .map(item => resultMap.get(String(item?.id)))
          .filter(Boolean);
        const response = {
          ok: true,
          transport: "engine-worker-pool-batch",
          results,
          pendingIds: [...new Set(pendingIds.map(String))],
          durationMs: Math.max(Date.now() - started, durationMs),
          requestDurationMs: Date.now() - started,
          partial: pendingIds.length > 0 || results.length < normalized.length,
          splitBatch: true,
          poolSize: this.poolSize,
          lanes: lanes.map((lane, index) => ({ workerIndex: index % this.poolSize, items: lane.length })),
          chunkedItems,
          chunkMetrics,
          itemMetrics,
          engineDiagnostics,
          workerStatus: {
            pool: this.getLocalDiagnostics(),
            workers: workerStatuses
          },
          workerTrace: workerTraces.length ? { version: 1, pool: true, workers: workerTraces } : null
        };
        this.rememberSlowRequest({
          type: "CHECK_BATCH_POOL",
          durationMs: response.durationMs,
          items: normalized.length,
          chars: normalized.reduce((sum, item) => sum + String(item?.text || "").length, 0),
          jobId: meta.jobId || "",
          resultIssues: results.reduce((sum, item) => sum + (Array.isArray(item?.issues) ? item.issues.length : 0), 0),
          sample: normalized.map(item => String(item?.text || "").slice(0, 80)).join(" | ")
        });
        return response;
      });
    }

    cancelBatchRequest(requestId) {
      const token = String(requestId || "");
      if (!token) return false;
      this.stats.cancelledBatches += 1;
      for (let index = 0; index < this.poolSize; index += 1) {
        const worker = this.workers[index];
        if (!worker) continue;
        try { worker.postMessage({ id: `cancel-${token}-${index}`, type: "CANCEL_BATCH", payload: { requestId: token } }); } catch (_) {}
      }
      return true;
    }

    getStatus(options = {}) {
      return this.request("GET_STATUS", {}, { timeoutMs: options.timeoutMs || 2500 });
    }

    getDiagnostics(options = {}) {
      return this.request("GET_DIAGNOSTICS", {}, { timeoutMs: options.timeoutMs || 3500 });
    }

    getLocalDiagnostics() {
      this.refreshPendingCounts();
      return {
        ...this.stats,
        pending: this.pending.size,
        workerAlive: this.workers.some(Boolean),
        aliveWorkers: this.workers.filter(Boolean).length,
        revision: this.revision
      };
    }
  }

  globalThis.CorrectorEngineWorkerClient = CorrectorEngineWorkerClient;
})();
