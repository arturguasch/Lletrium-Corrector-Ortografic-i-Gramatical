/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Token analysis with immutable lexical readings and an ordered context view. */
(() => {
  "use strict";

  const copyReading = reading => ({ ...reading });

  function createTokenAnalysis(token, context = {}) {
    const lexicalReadings = Object.freeze((token.readings || []).map(reading => Object.freeze(copyReading(reading))));
    const contextualReadings = lexicalReadings.map(copyReading);
    return {
      ...token,
      surface: token.text,
      lookupForm: String(token.text ?? "").normalize("NFC").replace(/’/gu, "'"),
      whitespaceBefore: Boolean(context.whitespaceBefore),
      sentenceStart: Boolean(context.sentenceStart),
      sentenceEnd: Boolean(context.sentenceEnd),
      paragraphEnd: Boolean(context.paragraphEnd),
      lexicalReadings,
      contextualReadings,
      preDisambiguationReadings: contextualReadings,
      preDisambiguationShared: true,
      readings: contextualReadings,
      chunkTags: token.chunkTags?.slice() || (lexicalReadings.some(reading => reading.source === "languagetool-incorrect-verb")
        ? ["_incorrect_verb_"] : []),
      immunized: false,
      ignoredBySpeller: false,
      contextTrace: []
    };
  }

  function record(token, stage, operation, detail = {}) {
    token.contextTrace.push({ stage, operation, ...detail });
  }

  function addReading(token, reading, stage) {
    if (!token.contextualReadings.some(row => row.lemma === reading.lemma && row.tag === reading.tag)) {
      // AnalyzedTokenReadings.addReading drops the final unknown reading.
      if (token.contextualReadings.at(-1)?.tag == null) token.contextualReadings.pop();
      token.contextualReadings.push(copyReading(reading));
      token.readings = token.contextualReadings;
      record(token, stage, "ADD", { lemma: reading.lemma, tag: reading.tag });
    }
  }

  function removeReading(token, predicate, stage) {
    const before = token.contextualReadings.length;
    token.contextualReadings = token.contextualReadings.filter(reading => !predicate(reading));
    if (token.preDisambiguationShared) token.preDisambiguationReadings = token.contextualReadings;
    token.readings = token.contextualReadings;
    if (token.contextualReadings.length !== before) record(token, stage, "REMOVE", { removed: before - token.contextualReadings.length });
  }

  function replaceReadings(token, readings, stage, operation = "REPLACE") {
    token.preDisambiguationShared = false;
    token.contextualReadings = readings.map(copyReading);
    if (token.sentenceEnd && !token.contextualReadings.some(reading => reading.tag === "SENT_END")) {
      if (token.contextualReadings.at(-1)?.tag == null) token.contextualReadings.pop();
      token.contextualReadings.push({ token: token.text, lemma: token.contextualReadings[0]?.lemma ?? null, tag: "SENT_END" });
    }
    token.readings = token.contextualReadings;
    record(token, stage, operation, { count: readings.length });
  }

  function addChunkTag(token, tag, stage) {
    if (!token.chunkTags.includes(tag)) {
      token.chunkTags.push(tag);
      record(token, stage, "ADDCHUNK", { tag });
    }
  }

  function applyFlags(token, { immunized, ignoredBySpeller } = {}, stage) {
    if (immunized != null && token.immunized !== immunized) {
      token.immunized = immunized;
      record(token, stage, "IMMUNIZE", { value: immunized });
    }
    if (ignoredBySpeller != null && token.ignoredBySpeller !== ignoredBySpeller) {
      token.ignoredBySpeller = ignoredBySpeller;
      record(token, stage, "IGNORE_SPELLING", { value: ignoredBySpeller });
    }
  }

  function snapshot(token) {
    return {
      ...token,
      lexicalReadings: token.lexicalReadings.map(copyReading),
      contextualReadings: token.contextualReadings.map(copyReading),
      readings: token.contextualReadings.map(copyReading),
      chunkTags: token.chunkTags.slice(),
      contextTrace: token.contextTrace.map(step => ({ ...step }))
    };
  }

  globalThis.CorrectorCatalanAnalysis = Object.freeze({
    createTokenAnalysis, addReading, removeReading, replaceReadings,
    addChunkTag, applyFlags, record, snapshot
  });
})();
