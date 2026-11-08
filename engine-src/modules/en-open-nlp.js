/* Browser reader/inference primitives for the exact local OpenNLP 1.9.5 models. */
(() => {
  "use strict";
  const decoder = new TextDecoder("utf-8", { fatal: true });

  function parseBinaryGis(buffer) {
    const view = new DataView(buffer), bytes = new Uint8Array(buffer); let offset = 0;
    const need = size => { if (!Number.isInteger(size) || size < 0 || offset + size > buffer.byteLength) throw new Error("Truncated OpenNLP GIS model."); };
    const readUint16 = () => { need(2); const value = view.getUint16(offset, false); offset += 2; return value; };
    const readInt32 = () => { need(4); const value = view.getInt32(offset, false); offset += 4; return value; };
    const readDouble = () => { need(8); const value = view.getFloat64(offset, false); offset += 8; return value; };
    const readUtf = () => {
      const length = readUint16(); need(length); const end = offset + length, units = [];
      while (offset < end) {
        const first = bytes[offset++];
        if ((first & 0x80) === 0) units.push(first);
        else if ((first & 0xe0) === 0xc0) {
          if (offset >= end) throw new Error("Malformed OpenNLP modified UTF-8 string.");
          const second = bytes[offset++];
          if ((second & 0xc0) !== 0x80) throw new Error("Malformed OpenNLP modified UTF-8 continuation.");
          units.push(((first & 0x1f) << 6) | (second & 0x3f));
        } else if ((first & 0xf0) === 0xe0) {
          if (offset + 1 >= end) throw new Error("Malformed OpenNLP modified UTF-8 string.");
          const second = bytes[offset++], third = bytes[offset++];
          if ((second & 0xc0) !== 0x80 || (third & 0xc0) !== 0x80) throw new Error("Malformed OpenNLP modified UTF-8 continuation.");
          units.push(((first & 0x0f) << 12) | ((second & 0x3f) << 6) | (third & 0x3f));
        } else throw new Error("Malformed OpenNLP modified UTF-8 lead byte.");
      }
      let value = "";
      for (let index = 0; index < units.length; index += 8192) value += String.fromCharCode(...units.slice(index, index + 8192));
      return value;
    };
    const checkedCount = (value, limit, label) => {
      if (value < 0 || value > limit) throw new Error(`Invalid OpenNLP ${label}: ${value}`);
      return value;
    };
    if (readUtf() !== "GIS") throw new Error("Unsupported OpenNLP binary model type.");
    const correctionConstant = readInt32(), correctionParameter = readDouble();
    if (correctionConstant < 1 || !Number.isFinite(correctionParameter)) throw new Error("Invalid OpenNLP GIS correction parameters.");
    const outcomeCount = checkedCount(readInt32(), 256, "outcome count");
    const outcomes = Array.from({ length: outcomeCount }, readUtf);
    const patternCount = checkedCount(readInt32(), 2_000_000, "outcome-pattern count");
    const patterns = Array.from({ length: patternCount }, () => {
      const values = readUtf().trim().split(/\s+/u).map(Number);
      if (values.length < 2 || !Number.isInteger(values[0]) || values[0] < 1
          || values.slice(1).some(value => !Number.isInteger(value) || value < 0 || value >= outcomeCount)) {
        throw new Error("Invalid OpenNLP GIS outcome pattern.");
      }
      return values;
    });
    const featureCount = checkedCount(readInt32(), 2_000_000, "predicate count");
    const names = Array.from({ length: featureCount }, readUtf);
    let totalWeights = 0;
    for (const pattern of patterns) totalWeights += pattern[0] * (pattern.length - 1);
    if (totalWeights > 50_000_000) throw new Error("OpenNLP GIS weight table exceeds safe limits.");
    const unsortedStarts = new Uint32Array(featureCount + 1), unsortedOutcomes = new Uint16Array(totalWeights), unsortedWeights = new Float64Array(totalWeights);
    let featureIndex = 0, weightIndex = 0;
    for (const pattern of patterns) {
      const count = pattern[0], outcomeIndexes = pattern.slice(1);
      for (let row = 0; row < count; row++) {
        if (featureIndex >= featureCount) throw new Error("OpenNLP GIS outcome patterns exceed predicate count.");
        unsortedStarts[featureIndex] = weightIndex;
        for (const outcome of outcomeIndexes) {
          const weight = readDouble();
          if (!Number.isFinite(weight)) throw new Error("Invalid OpenNLP GIS predicate weight.");
          unsortedOutcomes[weightIndex] = outcome; unsortedWeights[weightIndex] = weight; weightIndex++;
        }
        featureIndex++;
      }
    }
    if (featureIndex !== featureCount || offset !== buffer.byteLength) throw new Error("OpenNLP GIS model dimensions or trailing bytes are invalid.");
    unsortedStarts[featureCount] = weightIndex;
    const order = Array.from({ length: featureCount }, (_unused, index) => index).sort((left, right) => names[left] < names[right] ? -1 : names[left] > names[right] ? 1 : 0);
    const featureNames = new Array(featureCount), featureStarts = new Uint32Array(featureCount + 1);
    const weightOutcomes = new Uint16Array(totalWeights), weightValues = new Float64Array(totalWeights);
    let sortedWeightIndex = 0;
    for (let index = 0; index < featureCount; index++) {
      const originalIndex = order[index], start = unsortedStarts[originalIndex], end = unsortedStarts[originalIndex + 1];
      featureNames[index] = names[originalIndex]; featureStarts[index] = sortedWeightIndex;
      weightOutcomes.set(unsortedOutcomes.subarray(start, end), sortedWeightIndex);
      weightValues.set(unsortedWeights.subarray(start, end), sortedWeightIndex);
      sortedWeightIndex += end - start;
    }
    featureStarts[featureCount] = sortedWeightIndex;
    return { outcomes, featureNames, featureStarts, weightOutcomes, weightValues, correctionConstant, correctionParameter };
  }

  class MaxentModel {
    constructor(buffer, expectedKind) {
      if (!(buffer instanceof ArrayBuffer)) throw new TypeError("OpenNLP model data must be an ArrayBuffer.");
      if (buffer.byteLength >= 5 && new Uint8Array(buffer, 0, 5).join(",") === "0,3,71,73,83") {
        const parsed = parseBinaryGis(buffer);
        this.kind = expectedKind; this.modelType = "Maxent"; this.outcomes = parsed.outcomes;
        this.featureNames = parsed.featureNames; this.featureStarts = parsed.featureStarts;
        this.weightOutcomes = parsed.weightOutcomes; this.weightValues = parsed.weightValues;
        return;
      }
      const view = new DataView(buffer); let offset = 0;
      const readBytes = length => { if (length < 0 || offset + length > buffer.byteLength) throw new Error("Truncated OpenNLP model resource."); const bytes = new Uint8Array(buffer, offset, length); offset += length; return bytes; };
      const readUtf = () => { const length = view.getInt32(offset, false); offset += 4; return decoder.decode(readBytes(length)); };
      if (decoder.decode(readBytes(6)) !== "ONLPX1") throw new Error("Unsupported OpenNLP model encoding.");
      this.kind = readUtf(); this.modelType = readUtf();
      if (this.kind !== expectedKind || this.modelType !== "Maxent") throw new Error(`Unexpected OpenNLP ${expectedKind} model type: ${this.kind}/${this.modelType}`);
      const outcomeCount = view.getInt32(offset, false); offset += 4;
      if (outcomeCount < 1 || outcomeCount > 256) throw new Error("Invalid OpenNLP outcome count.");
      this.outcomes = Array.from({ length: outcomeCount }, readUtf);
      const featureCount = view.getInt32(offset, false); offset += 4;
      if (featureCount < 1 || featureCount > 2_000_000) throw new Error("Invalid OpenNLP predicate count.");
      this.featureNames = new Array(featureCount);
      this.featureStarts = new Uint32Array(featureCount + 1);
      const entriesOffset = offset;
      let totalWeights = 0, previousName = "";
      for (let i = 0; i < featureCount; i++) {
        const name = readUtf();
        if (i && name <= previousName) throw new Error("OpenNLP predicates are not in canonical sorted order.");
        previousName = name;
        this.featureNames[i] = name;
        if (offset + 2 > buffer.byteLength) throw new Error("Truncated OpenNLP predicate weights.");
        const count = view.getUint16(offset, false); offset += 2;
        this.featureStarts[i] = totalWeights;
        totalWeights += count;
        for (let j = 0; j < count; j++) {
          if (offset + 10 > buffer.byteLength) throw new Error("Truncated OpenNLP outcome weights.");
          const outcome = view.getUint16(offset, false), weight = view.getFloat64(offset + 2, false); offset += 10;
          if (outcome >= outcomeCount || !Number.isFinite(weight)) throw new Error("Invalid OpenNLP weight entry.");
        }
      }
      if (offset !== buffer.byteLength) throw new Error("Unexpected trailing bytes in OpenNLP model.");
      this.featureStarts[featureCount] = totalWeights;
      this.weightOutcomes = new Uint16Array(totalWeights);
      this.weightValues = new Float64Array(totalWeights);
      offset = entriesOffset;
      for (let i = 0; i < featureCount; i++) {
        const length = view.getInt32(offset, false); offset += 4 + length;
        const count = view.getUint16(offset, false); offset += 2;
        for (let j = 0; j < count; j++) {
          const index = this.featureStarts[i] + j;
          this.weightOutcomes[index] = view.getUint16(offset, false);
          this.weightValues[index] = view.getFloat64(offset + 2, false);
          offset += 10;
        }
      }
    }

    evaluate(context) {
      const scores = new Float64Array(this.outcomes.length);
      for (const feature of context) {
        let low = 0, high = this.featureNames.length - 1, found = -1;
        while (low <= high) {
          const middle = (low + high) >>> 1, candidate = this.featureNames[middle];
          if (candidate === feature) { found = middle; break; }
          if (candidate < feature) low = middle + 1; else high = middle - 1;
        }
        if (found < 0) continue;
        for (let weight = this.featureStarts[found]; weight < this.featureStarts[found + 1]; weight++) {
          scores[this.weightOutcomes[weight]] += this.weightValues[weight];
        }
      }
      let maximum = -Infinity;
      for (const value of scores) if (value > maximum) maximum = value;
      let total = 0;
      for (let i = 0; i < scores.length; i++) { scores[i] = Math.exp(scores[i] - maximum); total += scores[i]; }
      for (let i = 0; i < scores.length; i++) scores[i] /= total;
      return scores;
    }

    best(context) {
      const probabilities = this.evaluate(context); let best = 0;
      for (let i = 1; i < probabilities.length; i++) if (probabilities[i] > probabilities[best]) best = i;
      return { outcome: this.outcomes[best], probability: probabilities[best], probabilities };
    }
  }

  // The extension receives text from browsers and office editors, where NBSP
  // and the other Unicode space separators are common. Keep the model's
  // whitespace boundaries aligned with the source tokenizer's `\s` class;
  // offsets remain UTF-16 offsets into the untouched sentence text.
  const javaWhitespace = char => /\s/u.test(char);
  const addCharPredicates = (name, char, features) => {
    features.push(`${name}=${char}`);
    if (/\p{L}/u.test(char)) {
      features.push(`${name}_alpha`);
      if (/\p{Lu}/u.test(char)) features.push(`${name}_caps`);
    } else if (/\p{Nd}/u.test(char)) features.push(`${name}_num`);
    else if (javaWhitespace(char)) features.push(`${name}_ws`);
    else if (/[.?!]/u.test(char)) features.push(`${name}_eos`);
    else if (/['"`]/u.test(char)) features.push(`${name}_quote`);
    else if (/[([{]/u.test(char)) features.push(`${name}_lp`);
    else if (/[)\]}]/u.test(char)) features.push(`${name}_rp`);
  };

  class EnglishOpenNlp {
    constructor(models, abbreviations, posNgramWords, posTagDictionary, manifest) {
      this.models = models; this.abbreviations = abbreviations; this.posNgramWords = posNgramWords;
      this.posTagDictionary = posTagDictionary.tags; this.posTagDictionaryCaseSensitive = posTagDictionary.caseSensitive;
      this.manifest = manifest;
      this.profile = "en-US";
    }

    tokenizerContext(text, offset) {
      const features = [], previous = text.substring(0, offset), following = text.substring(offset);
      features.push(`p=${previous}`, `s=${following}`);
      if (offset > 0) {
        addCharPredicates("p1", text.charAt(offset - 1), features);
        if (offset > 1) {
          addCharPredicates("p2", text.charAt(offset - 2), features);
          features.push(`p21=${text.charAt(offset - 2)}${text.charAt(offset - 1)}`);
        } else features.push("p2=bok");
        features.push(`p1f1=${text.charAt(offset - 1)}${text.charAt(offset)}`);
      } else { features.push("p1=bok", "p2=bok"); }
      addCharPredicates("f1", text.charAt(offset), features);
      if (offset + 1 < text.length) {
        addCharPredicates("f2", text.charAt(offset + 1), features);
        features.push(`f12=${text.charAt(offset)}${text.charAt(offset + 1)}`);
      } else features.push("f2=bok");
      if (text.startsWith("&", 0) && text.endsWith(";")) features.push("cc");
      if (offset === text.length && this.abbreviations.has(text)) features.push("pabb");
      return features;
    }

    tokenizeForChunking(text) {
      if (typeof text !== "string") throw new TypeError("Sentence to tokenize must be a string.");
      const spans = []; let start = -1;
      for (let index = 0; index <= text.length; index++) {
        const whitespace = index === text.length || javaWhitespace(text.charAt(index));
        if (!whitespace && start < 0) start = index;
        if (whitespace && start >= 0) { spans.push({ start, end: index }); start = -1; }
      }
      const output = [];
      for (const span of spans) {
        const value = text.slice(span.start, span.end);
        if (value.length < 2 || /^[A-Za-z0-9]+$/u.test(value)) { output.push({ text: value, start: span.start, end: span.end, probability: 1 }); continue; }
        let tokenStart = span.start, probability = 1;
        for (let boundary = span.start + 1; boundary < span.end; boundary++) {
          const decision = this.models.tokenizer.best(this.tokenizerContext(value, boundary - span.start));
          probability *= decision.probability;
          if (decision.outcome === "T") {
            output.push({ text: text.slice(tokenStart, boundary), start: tokenStart, end: boundary, probability });
            tokenStart = boundary; probability = 1;
          }
        }
        output.push({ text: text.slice(tokenStart, span.end), start: tokenStart, end: span.end, probability });
      }
      return output;
    }

    posContext(index, words, previousTags) {
      const value = words[index], features = ["default", `w=${value}`];
      if (!this.posNgramWords.has(value)) {
        for (let length = 1; length <= 4; length++) {
          features.push(`suf=${value.slice(-length)}`, `pre=${value.slice(0, length)}`);
        }
        if (value.includes("-")) features.push("h");
        if (/[A-Z]/u.test(value)) features.push("c");
        if (/[0-9]/u.test(value)) features.push("d");
      }
      const previousWord = index > 0 ? words[index - 1] : "*SB*";
      const previousTag = index > 0 ? previousTags[index - 1] : "*SB*";
      const twoBackWord = index > 1 ? words[index - 2] : "*SB*";
      const twoBackTag = index > 1 ? previousTags[index - 2] : "*SB*";
      features.push(`p=${previousWord}`);
      if (index > 0) features.push(`t=${previousTag}`, `pp=${twoBackWord}`);
      if (index > 1) features.push(`t2=${twoBackTag},${previousTag}`);
      features.push(`n=${words[index + 1] ?? "*SE*"}`, `nn=${words[index + 2] ?? "*SE*"}`);
      return features;
    }

    chunkContext(index, words, posTags, previousChunks) {
      const word = offset => words[index + offset] ?? (offset < 0 ? "bos" : "eos");
      const pos = offset => posTags[index + offset] ?? (offset < 0 ? "bos" : "eos");
      const prior = offset => index + offset < 0 ? "bos" : previousChunks[index + offset] ?? "O";
      const w = [word(-2), word(-1), word(0), word(1), word(2)];
      const t = [pos(-2), pos(-1), pos(0), pos(1), pos(2)];
      const posLabel = value => value < 0 ? `_${Math.abs(value)}` : value;
      const p2 = index < 2 ? "p_2=bos" : `p_2${prior(-2)}`, p1 = `p_1=${prior(-1)}`;
      const features = [
        `w_2=${w[0]}`, `w_1=${w[1]}`, `w0=${w[2]}`, `w1=${w[3]}`, `w2=${w[4]}`,
        `w_1=${w[1]}w0=${w[2]}`, `w0=${w[2]}w1=${w[3]}`,
        `t_2=${t[0]}`, `t_1=${t[1]}`, `t0=${t[2]}`, `t1=${t[3]}`, `t2=${t[4]}`,
        `t_2=${t[0]}t_1=${t[1]}`, `t_1=${t[1]}t0=${t[2]}`, `t0=${t[2]}t1=${t[3]}`, `t1=${t[3]}t2=${t[4]}`,
        `t_2=${t[0]}t_1=${t[1]}t0=${t[2]}`, `t_1=${t[1]}t0=${t[2]}t1=${t[3]}`, `t0=${t[2]}t1=${t[3]}t2=${t[4]}`,
        p2, p1, `${p2}${p1}`
      ];
      for (let start = 0; start < 5; start++) features.push(`${p1}t${start - 2 < 0 ? `_${Math.abs(start - 2)}` : start - 2 === 0 ? "0" : start - 2}=${t[start]}`);
      for (let start = 0; start < 4; start++) {
        const first = start - 2, second = first + 1;
        const firstLabel = posLabel(first), secondLabel = posLabel(second);
        features.push(`${p1}t${firstLabel}=${t[start]}t${secondLabel}=${t[start + 1]}`);
      }
      for (let start = 0; start < 3; start++) {
        const labels = [start - 2, start - 1, start].map(posLabel);
        features.push(`${p1}t${labels[0]}=${t[start]}t${labels[1]}=${t[start + 1]}t${labels[2]}=${t[start + 2]}`);
      }
      for (let start = 0; start < 5; start++) {
        const value = start - 2, label = value < 0 ? `_${Math.abs(value)}` : value;
        features.push(`${p1}w${label}=${w[start]}`);
      }
      features.push(`${p1}w_1=${w[1]}w0=${w[2]}`, `${p1}w0=${w[2]}w1=${w[3]}`);
      return features;
    }

    bestSequence(model, length, contextForIndex, beamSize, validate = () => true) {
      let beam = [{ outcomes: [], score: 0 }];
      for (let index = 0; index < length; index++) {
        const candidates = [];
        for (const sequence of beam) {
          const probabilities = model.evaluate(contextForIndex(index, sequence.outcomes));
          // OpenNLP 1.9.5 BeamSearch first finds the probability threshold for
          // the top `size` outcomes of this parent sequence, then applies its
          // SequenceValidator to those outcomes. Filtering all outcomes
          // before pruning (the former JS behavior) can admit a lower-ranked
          // tag that OpenNLP never considers, changing the complete POS/chunk
          // path despite identical models, context features, and dictionaries.
          const sortedProbabilities = Array.from(probabilities).sort((left, right) => left - right);
          const threshold = sortedProbabilities[Math.max(0, sortedProbabilities.length - beamSize)] ?? 0;
          const appendValid = (minimumProbability, requireThreshold) => {
            let added = 0;
            for (let outcomeIndex = 0; outcomeIndex < model.outcomes.length; outcomeIndex++) {
              const outcome = model.outcomes[outcomeIndex], probability = probabilities[outcomeIndex];
              if (requireThreshold && probability < minimumProbability) continue;
              if (!validate(index, sequence.outcomes, outcome) || probability <= 0) continue;
              const score = sequence.score + Math.log(probability);
              if (score <= -100000) continue; // OpenNLP's default minimum sequence score.
              candidates.push({ outcomes: [...sequence.outcomes, outcome], score });
              added++;
            }
            return added;
          };
          const added = appendValid(threshold, true);
          // OpenNLP falls back to all valid outcomes only when no candidate
          // has entered the next beam at all. Preserve that edge case too.
          if (added === 0 && candidates.length === 0) appendValid(0, false);
        }
        candidates.sort((left, right) => right.score - left.score);
        beam = candidates.slice(0, beamSize);
        if (!beam.length) throw new Error(`OpenNLP ${model.kind} sequence decoder produced no valid path at token ${index}.`);
      }
      return beam[0]?.outcomes || [];
    }

    applyEnglishChunkFilter(tokens, morphology = null) {
      const output = []; let activeType = null;
      const isStart = token => token.chunkTag === "B-NP";
      const isContinuation = token => token.chunkTag === "I-NP";
      const isEnd = (list, index) => index >= list.length - 1 || !isContinuation(list[index + 1]);
      const hasPluralReadingInChunkSequence = start => {
        for (let cursor = start; cursor < tokens.length; cursor++) {
          if (!isStart(tokens[cursor]) && !isContinuation(tokens[cursor])) break;
          if (hasPluralNounReading(tokens[cursor])) return true;
        }
        return false;
      };
      const hasPluralNounReading = token => {
        const readings = morphology
          ? globalThis.CorrectorEnglishTagger.tagToken(token.text, morphology).readings
          : [{ tag: token.posTag }];
        return readings.some(reading => reading.tag === "NNS");
      };
      for (let index = 0; index < tokens.length; index++) {
        const originalChunkTag = tokens[index].chunkTag;
        const token = { ...tokens[index], chunkTags: [] };
        if (isStart(token)) {
          let end = index;
          while (end < tokens.length - 1 && isContinuation(tokens[end + 1])) end++;
          // Match EnglishChunkFilter.getChunkType(): a sequence may contain
          // consecutive B-NP chunks. Its end check starts at this phrase's
          // final token but scans the same B/I sequence forward.
          const pluralAtStart = hasPluralReadingInChunkSequence(index);
          const endIsSingular = !hasPluralReadingInChunkSequence(end);
          activeType = pluralAtStart && !endIsSingular ? "plural" : "singular";
          token.chunkTags = [`B-NP-${activeType}`];
        }
        if (activeType && isEnd(tokens, index)) { token.chunkTags.push(`E-NP-${activeType}`); activeType = null; }
        if (activeType && isContinuation(token)) token.chunkTags.push(`I-NP-${activeType}`);
        // EnglishChunkFilter replaces the raw B-NP/I-NP tag with the enriched
        // tag set whenever it emits a singular/plural boundary or continuation.
        // Keeping both caused XML patterns to see an extra untyped chunk tag.
        if (!token.chunkTags.length) token.chunkTags = [originalChunkTag];
        output.push(token);
      }
      return output;
    }

    tagAndChunk(text, morphology = null) {
      const tokens = this.tokenizeForChunking(text), words = tokens.map(token => token.text);
      if (!words.length) return [];
      const posTags = this.bestSequence(this.models.pos, words.length,
        (index, previous) => this.posContext(index, words, previous), 3,
        (index, _previous, outcome) => {
          const key = this.posTagDictionaryCaseSensitive ? words[index] : words[index].toLocaleLowerCase("en");
          const allowed = this.posTagDictionary.get(key);
          return !allowed || allowed.has(outcome);
        });
      const chunks = this.bestSequence(this.models.chunker, words.length,
        (index, previous) => this.chunkContext(index, words, posTags, previous), 10,
        (_index, previous, outcome) => !outcome.startsWith("I-") || previous.length > 0 && previous.at(-1) !== "O" && previous.at(-1).slice(2) === outcome.slice(2));
      return this.applyEnglishChunkFilter(tokens.map((token, index) => ({ ...token, posTag: posTags[index], chunkTag: chunks[index] })), morphology);
    }

    getDiagnostics() {
      return { profile: this.profile, runtime: "OpenNLP 1.9.5 Maxent predicates; local JS evaluator",
        models: Object.fromEntries(Object.entries(this.models).map(([key, model]) => [key, { outcomes: model.outcomes.length, predicates: model.featureNames.length, weightedFeatures: model.weightValues.length, sourceModelSha256: this.manifest.openNlp.models[key].sourceModelSha256 }])),
        tokenizerAbbreviations: this.abbreviations.size, posNgramWords: this.posNgramWords.size, posTagDictionaryWords: this.posTagDictionary.size,
        executed: { tokenizer: true, posTagger: true, chunker: true, chunkFilter: true } };
    }

    static async load({ baseUrl, fetcher = globalThis.fetch } = {}) {
      const base = baseUrl || globalThis.chrome?.runtime?.getURL("build/resources/en-US/");
      if (!base) throw new Error("An en-US resource base URL is required outside the extension.");
      const response = await fetcher(new URL("resource-index.json", base));
      if (!response.ok) throw new Error(`Could not load en-US manifest (${response.status}).`);
      const manifest = await response.json();
      if (manifest.profile !== "en-US" || !["ONLPX1", "GIS1"].includes(manifest.openNlp?.format)) throw new Error("OpenNLP model manifest does not belong to en-US.");
      const models = Object.create(null);
      await Promise.all(Object.entries(manifest.openNlp.models).map(async ([kind, info]) => {
        const modelResponse = await fetcher(new URL(info.file, base));
        if (!modelResponse.ok || typeof DecompressionStream !== "function" || !globalThis.crypto?.subtle) throw new Error(`Could not load local OpenNLP ${kind} model.`);
        const compressed = new Uint8Array(await modelResponse.arrayBuffer());
        const compressedHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", compressed)), byte => byte.toString(16).padStart(2, "0")).join("");
        if (compressedHash !== info.compressedSha256) throw new Error(`OpenNLP ${kind} model hash mismatch.`);
        const raw = await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
        if (raw.byteLength !== info.rawBytes) throw new Error(`OpenNLP ${kind} model length mismatch.`);
        const rawHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", raw)), byte => byte.toString(16).padStart(2, "0")).join("");
        if (rawHash !== info.rawSha256) throw new Error(`OpenNLP ${kind} decoded model hash mismatch.`);
        models[kind] = new MaxentModel(raw, kind);
      }));
      const [abbreviationsResponse, wordsResponse] = await Promise.all([
        fetcher(new URL(manifest.openNlp.tokenizerAbbreviations.file, base)), fetcher(new URL(manifest.openNlp.posNgramWords.file, base))
      ]);
      const tagDictionaryResponse = await fetcher(new URL(manifest.openNlp.posTagDictionary.file, base));
      if (!abbreviationsResponse.ok || !wordsResponse.ok || !tagDictionaryResponse.ok) throw new Error("Could not load en-US OpenNLP auxiliary dictionaries.");
      const [abbreviationsText, wordsText, tagDictionaryText] = await Promise.all([abbreviationsResponse.text(), wordsResponse.text(), tagDictionaryResponse.text()]);
      const hashText = async text => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))), byte => byte.toString(16).padStart(2, "0")).join("");
      const [abbreviationHash, wordHash, tagDictionaryHash] = await Promise.all([hashText(abbreviationsText), hashText(wordsText), hashText(tagDictionaryText)]);
      if (abbreviationHash !== manifest.openNlp.tokenizerAbbreviations.sha256
          || wordHash !== manifest.openNlp.posNgramWords.sha256
          || tagDictionaryHash !== manifest.openNlp.posTagDictionary.sha256) throw new Error("OpenNLP auxiliary dictionary hash mismatch.");
      const set = text => new Set(text.split(/\r?\n/u).filter(Boolean));
      const tagLines = tagDictionaryText.split(/\r?\n/u).filter(line => line && !line.startsWith("#"));
      const tagDictionary = new Map(tagLines.map(line => {
        const [word, tags, extra] = line.split("\t");
        if (!word || !tags || extra != null) throw new Error("Malformed OpenNLP POS tag dictionary entry.");
        return [word, new Set(tags.split(" ").filter(Boolean))];
      }));
      if (tagDictionary.size !== manifest.openNlp.posTagDictionary.entries) throw new Error("OpenNLP POS tag dictionary entry count mismatch.");
      return new EnglishOpenNlp(models, set(abbreviationsText), set(wordsText),
        { tags: tagDictionary, caseSensitive: manifest.openNlp.posTagDictionary.caseSensitive }, manifest);
    }
  }
  globalThis.CorrectorEnglishOpenNlp = EnglishOpenNlp;
})();
