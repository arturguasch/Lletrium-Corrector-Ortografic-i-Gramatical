/* Local en-US port of LanguageTool's UnitConversionRuleUS / AbstractUnitConversionRule. */
(() => {
  "use strict";

  const DELTA = 0.01;
  // LanguageTool's formatter checks `size > 5` before adding each variant,
  // so its observable cap is six suggestions.
  const MAX_SUGGESTIONS = 5;
  const NUMBER = "(-?[0-9]{1,32}[0-9,.]{0,32})";
  const metricUnits = [];
  const units = [];
  const unitByPattern = [];

  function addMetric(dimension, factor, symbols, groupKey = `${dimension}:${factor}`) {
    const existing = metricUnits.find(unit => unit.groupKey === groupKey);
    if (existing) {
      for (const symbol of symbols) if (!existing.symbols.includes(symbol)) existing.symbols.push(symbol);
    } else metricUnits.push({ dimension, factor, symbols: [...symbols], groupKey });
  }
  function addUnit(pattern, dimension, factor, metric = false, symbols = [], groupKey = `${dimension}:${factor}`) {
    const key = groupKey;
    const existing = units.find(entry => entry.key === key)?.unit;
    const unit = existing || { dimension, factor, metric: false, symbols: [] };
    unit.metric ||= metric;
    for (const symbol of symbols) if (!unit.symbols.includes(symbol)) unit.symbols.push(symbol);
    const regex = new RegExp(`${NUMBER}[\\s\\u00a0]{0,5}(?:${pattern})\\b`, "giu");
    unitByPattern.push({ regex, pattern, unit });
    if (!existing) units.push({ key, unit });
    if (metric) addMetric(dimension, factor, symbols.length ? symbols : [pattern], groupKey);
  }

  // SI equivalents appear in LanguageTool's insertion order; naturalness
  // sorting below selects the most readable magnitude before formatting.
  addMetric("mass", 1, ["kg"]); addMetric("mass", 1e-3, ["g"]); addMetric("mass", 1e3, ["t"]);
  addMetric("speed", 1, ["km/h"]);
  addMetric("length", 1e3, ["km"]); addMetric("length", 1, ["m"]);
  addMetric("length", 1e-2, ["cm"]); addMetric("length", 1e-3, ["mm"]);
  addMetric("length", 1e-6, ["µm"]); addMetric("length", 1e-9, ["nm"]);
  addMetric("area", 1, ["m²"]); addMetric("area", 1e4, ["ha"]); addMetric("area", 1e2, ["a"]);
  addMetric("area", 1e6, ["km²"]); addMetric("area", 1e-4, ["cm²"]); addMetric("area", 1e-6, ["mm²"]);
  addMetric("area", 1e-12, ["µm²"]); addMetric("area", 1e-18, ["nm²"]);
  addMetric("volume", 1e3, ["m³"], "volume:m3"); addMetric("volume", 1e12, ["km³"], "volume:km3");
  addMetric("volume", 1e-3, ["cm³", "cubic centimeters"], "volume:cm3"); addMetric("volume", 1e-6, ["mm³", "cubic millimeters"], "volume:mm3");
  addMetric("volume", 1e-15, ["µm³", "cubic micrometers"], "volume:um3"); addMetric("volume", 1e-24, ["nm³", "cubic nanometers"], "volume:nm3");
  addMetric("volume", 1, ["l"], "volume:l"); addMetric("volume", 1e-3, ["ml"], "volume:ml");
  addMetric("temperature", 1, ["°C", "degree Celsius"], "temperature:C");

  // AbstractUnitConversionRule abbreviations.
  addUnit("kg", "mass", 1, true, ["kg"]); addUnit("g", "mass", 1e-3, true, ["g"]);
  addUnit("t", "mass", 1e3, true, ["t"]); addUnit("kilograms?", "mass", 1, true, ["kilogram"]);
  addUnit("grams?", "mass", 1e-3, true, ["gram"]); addUnit("tons?", "mass", 1e3, true, ["ton"]);
  addUnit("lb", "mass", 0.45359237, false, ["lb"]);
  addUnit("pounds?", "mass", 0.45359237, false, ["pounds"]);
  addUnit("mi", "length", 1609.344, false, ["mi"]); addUnit("yd", "length", 0.9144, false, ["yd"]);
  addUnit("miles?", "length", 1609.344, false, ["miles"]); addUnit("yards?", "length", 0.9144, false, ["yards"]);
  addUnit("feet|foot", "length", 0.3048, false, ["feet"]); addUnit("inches?", "length", 0.0254, false, ["inches"]);
  addUnit("(?:ft|′|')(?!(?:\\w|\\d))", "length", 0.3048);
  addUnit("(?:inch|″)(?!(?:\\w|\\d))", "length", 0.0254);
  addUnit("(?:km/h|kmh)", "speed", 1, true, ["km/h"]); addUnit("mph", "speed", 0.44704);
  addUnit("km", "length", 1e3, true, ["km"]); addUnit("m", "length", 1, true, ["m"]);
  addUnit("cm", "length", 1e-2, true, ["cm"]); addUnit("mm", "length", 1e-3, true, ["mm"]);
  addUnit("µm", "length", 1e-6, true, ["µm"]); addUnit("nm", "length", 1e-9, true, ["nm"]);
  addUnit("m(?:\\^2|2|²)", "area", 1, true, ["m²"]); addUnit("ha", "area", 1e4, true, ["ha"]);
  addUnit("a", "area", 1e2, true, ["a"]); addUnit("km(?:\\^2|2|²)", "area", 1e6, true, ["km²"]);
  addUnit("cm(?:\\^2|2|²)", "area", 1e-4, true, ["cm²"]); addUnit("mm(?:\\^2|2|²)", "area", 1e-6, true, ["mm²"]);
  addUnit("µm(?:\\^2|2|²)", "area", 1e-12, true, ["µm²"]); addUnit("nm(?:\\^2|2|²)", "area", 1e-18, true, ["nm²"]);
  addUnit("(?:sq|square) (?:in(?:ch)?|inches)", "area", 0.0254 ** 2); addUnit("(?:inches|in|inch)(?:\\^2|2|²)", "area", 0.0254 ** 2);
  addUnit("(?:sq|square) (?:ft|feet|foot)", "area", 0.3048 ** 2); addUnit("sf", "area", 0.3048 ** 2);
  addUnit("ft(?:\\^2|2|²)", "area", 0.3048 ** 2); addUnit("(?:sq|square) (?:yds?|yards?)", "area", 0.9144 ** 2);
  addUnit("(?:yards?|yds?)(?:\\^2|2|²)", "area", 0.9144 ** 2);
  addUnit("m(?:\\^3|3|³)", "volume", 1e3, true, ["m³"], "volume:m3"); addUnit("km(?:\\^3|3|³)", "volume", 1e12, true, ["km³"], "volume:km3");
  addUnit("cm(?:\\^3|3|³)", "volume", 1e-3, true, ["cm³", "cubic centimeters"], "volume:cm3"); addUnit("mm(?:\\^3|3|³)", "volume", 1e-6, true, ["mm³", "cubic millimeters"], "volume:mm3");
  addUnit("µm(?:\\^3|3|³)", "volume", 1e-15, true, ["µm³", "cubic micrometers"], "volume:um3"); addUnit("nm(?:\\^3|3|³)", "volume", 1e-24, true, ["nm³", "cubic nanometers"], "volume:nm3");
  addUnit("(?:cubic|cu) (?:feet|ft|foot)", "volume", 0.3048 ** 3); addUnit("(?:feet|ft|foot)(?:\\^3|3|³)", "volume", 0.3048 ** 3);
  addUnit("(?:cubic|cu) (?:inch|in|inches)", "volume", 0.0254 ** 3); addUnit("(?:inch|in)(?:\\^3|3|³)", "volume", 0.0254 ** 3);
  addUnit("(?:cubic|cu) (?:yards?|yds?)", "volume", 0.9144 ** 3); addUnit("(?:yard|yd)(?:\\^3|3|³)", "volume", 0.9144 ** 3);
  addUnit("l", "volume", 1, true, ["l"], "volume:l"); addUnit("ml", "volume", 1e-3, true, ["ml"], "volume:ml");
  addUnit("(?:degrees?)? Fahrenheit", "temperature", 5 / 9, false, ["degree Fahrenheit"], "temperature:F");
  addUnit("(?:degrees?)? Celsius", "temperature", 1, true, ["degree Celsius"], "temperature:C");
  addUnit("°F", "temperature", 5 / 9, false, ["°F"], "temperature:F");
  addUnit("°C", "temperature", 1, true, ["°C"], "temperature:C");
  units.find(entry => entry.key === "temperature:F").unit.offset = -160 / 9;

  // Locale-specific spellings and imperial units from UnitConversionRuleUS.
  addUnit("(?:kilometre|kilometer)s? per hour", "speed", 1, true, ["kilometers per hour"]);
  addUnit("kilomet(re|er)s?", "length", 1e3, true, ["kilometers"]); addUnit("met(re|er)s?", "length", 1, true, ["meters"]);
  addUnit("decimet(re|er)s?", "length", 0.1); addUnit("centimet(re|er)s?", "length", 1e-2, true, ["centimeters"]);
  addUnit("millimet(re|er)s?", "length", 1e-3, true, ["millimeters"]); addUnit("micromet(re|er)s?", "length", 1e-6, true, ["micrometers"]);
  addUnit("nanomet(re|er)s?", "length", 1e-9, true, ["nanometers"]);
  addUnit("square met(re|er)s?", "area", 1, true, ["square meters"]); addUnit("square kilomet(re|er)s?", "area", 1e6, true, ["square kilometers"]);
  addUnit("square decimet(re|er)s?", "area", 1e-2); addUnit("square centimet(re|er)s?", "area", 1e-4, true, ["square centimeters"]);
  addUnit("square millimet(re|er)s?", "area", 1e-6, true, ["square millimeters"]); addUnit("square micromet(re|er)s?", "area", 1e-12, true, ["square micrometers"]);
  addUnit("square nanomet(re|er)s?", "area", 1e-18, true, ["square nanometers"]);
  addUnit("cubic met(re|er)s?", "volume", 1e3, true, ["cubic meters"], "volume:m3"); addUnit("cubic kilomet(re|er)s?", "volume", 1e12, true, ["cubic kilometers"], "volume:km3");
  addUnit("cubic decimet(re|er)s?", "volume", 1); addUnit("cubic centimet(re|er)s?", "volume", 1e-3, true, ["cubic centimeters"], "volume:cm3");
  addUnit("cubic millimet(re|er)s?", "volume", 1e-6, true, ["cubic millimeters"], "volume:mm3"); addUnit("cubic micromet(re|er)s?", "volume", 1e-15, true, ["cubic micrometers"], "volume:um3");
  addUnit("cubic nanomet(re|er)s?", "volume", 1e-24, true, ["cubic nanometers"], "volume:nm3");
  addUnit("lit(re|er)s?", "volume", 1, true, ["liters"], "volume:l"); addUnit("millilit(re|er)s?", "volume", 1e-3, true, ["milliliters"], "volume:ml");
  addUnit("qt\\.", "volume", 0.946352946); addUnit("gal", "volume", 3.785411784); addUnit("pt", "volume", 0.473176473);
  addUnit("cup", "volume", 0.2365882365); addUnit("(?:fl.? oz.?|oz. fl.)", "volume", 0.0295735295625);
  addUnit("quarts?", "volume", 0.946352946); addUnit("gallons?", "volume", 3.785411784);
  addUnit("pints?", "volume", 0.473176473); addUnit("cups?", "volume", 0.2365882365);
  addUnit("(?:fluid )?ounces?", "volume", 0.0295735295625);

  const antiPatterns = [/(?:^|[^\d])\d+[-‐–]\d+(?:$|[^\d])/gu, /\d+\/\d+/gu, /\d+:\d+/gu, /\d+⁄\d+/gu, /\s?\d+'\d{3,}\s?/gu];
  const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
  const numberFormatThree = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
  function naturalness(value) {
    const abs = Math.abs(value);
    return abs < 1 ? 1 / (abs * abs * 2) : abs < 100 ? abs - 50 : abs * abs;
  }
  function toBase(value, unit) { return value * unit.factor + (unit.offset || 0); }
  function fromBase(value, unit) { return (value - (unit.offset || 0)) / unit.factor; }
  function metricEquivalents(value, unit) {
    if (unit.metric) return null;
    return metricUnits.filter(candidate => candidate.dimension === unit.dimension)
      .map(candidate => ({ unit: candidate, value: fromBase(toBase(value, unit), candidate) }))
      .sort((a, b) => naturalness(a.value) - naturalness(b.value));
  }
  function conversions(value, unit) {
    const equivalents = metricEquivalents(value, unit);
    if (!equivalents?.length) return null;
    const result = [];
    for (const equivalent of equivalents) {
      const rounded = Math.round(equivalent.value);
      for (const symbol of equivalent.unit.symbols) {
        if (result.length > MAX_SUGGESTIONS) break;
        const close = Math.abs(equivalent.value - rounded) / Math.abs(equivalent.value) < 0.05 && rounded !== 0;
        if (close) {
          const approx = `ca. ${numberFormat.format(rounded)} ${symbol}`;
          if (!result.includes(approx)) result.push(approx);
        }
        const exact = `${numberFormat.format(equivalent.value)} ${symbol}`;
        if (!result.includes(exact) && numberFormat.format(equivalent.value) !== "0") result.push(exact);
      }
      if (result.length > MAX_SUGGESTIONS) break;
    }
    return result;
  }
  function parseNumber(raw) {
    const value = Number(String(raw).replace(/,/gu, ""));
    return Number.isFinite(value) ? value : null;
  }
  function formatList(value, unit) {
    return conversions(value, unit) || [];
  }
  function formatInUnit(value, unit) {
    const result = [];
    const rounded = Math.round(value);
    for (const symbol of unit.symbols) {
      if (result.length > MAX_SUGGESTIONS) break;
      if (Math.abs(value - rounded) / Math.abs(value) < 0.05 && rounded !== 0) {
        const approx = `ca. ${numberFormat.format(rounded)} ${symbol}`;
        if (!result.includes(approx)) result.push(approx);
      }
      const exact = `${numberFormat.format(value)} ${symbol}`;
      if (!result.includes(exact) && numberFormat.format(value) !== "0") result.push(exact);
    }
    return result;
  }
  function findUnitInParenthetical(text) {
    const pattern = new RegExp(`^\\s*\\((?:ca\\.\\s*)?${NUMBER}\\s*([^)]+)\\)`, "iu");
    const match = pattern.exec(text);
    if (!match) return null;
    const body = match[2].trim();
    const unitMatch = unitByPattern.find(entry => {
      try { return new RegExp(`^(?:${entry.pattern})$`, "iu").test(body); } catch { return false; }
    });
    return unitMatch ? { match, value: parseNumber(match[1]), unit: unitMatch.unit, text: body } : { match, value: parseNumber(match[1]), unit: null, text: body };
  }
  function cleanNumberMatch(match) {
    return { text: match[0], start: match.index, end: match.index + match[0].length, value: parseNumber(match[1]) };
  }

  class EnglishUnitConversion {
    check(text) {
      const candidates = [];
      const ignoreRanges = [];
      const found = [];
      // AbstractUnitConversionRule's two special patterns combine feet and
      // inches into one value, retaining the leading whitespace in the range.
      const feetUnit = unitByPattern.find(entry => entry.unit.dimension === "length" && entry.unit.factor === 0.3048).unit;
      for (const regex of [/(?<=[^º°\d])\s(\d+)(?:ft|′|')\s*(\d+)\s*(?:in|"|″)?/gu,
        /(?<=[^º°\d\s])(\d+)(?:ft|′|')\s*(\d+)\s*(?:in|"|″)?/gu]) {
        for (const match of text.matchAll(regex)) found.push({ text: match[0], start: match.index,
          end: match.index + match[0].length, value: Number(match[1]) + Number(match[2]) / 12, unit: feetUnit });
      }
      for (const { regex, unit } of unitByPattern) {
        regex.lastIndex = 0;
        let match;
        while ((match = regex.exec(text))) {
          const range = cleanNumberMatch(match);
          found.push({ ...range, unit });
          if (!match[0].length) regex.lastIndex++;
        }
      }
      found.sort((a, b) => a.start - b.start || b.end - a.end);
      const selected = [];
      for (const item of found) {
        if (selected.some(other => item.start >= other.start && item.end <= other.end)) continue;
        selected.push(item);
      }
      for (const item of selected) {
        if (antiPatterns.some(pattern => { pattern.lastIndex = 0; return [...text.matchAll(pattern)].some(match => match.index < item.end && match.index + match[0].length > item.start); })) continue;
        if ([...text.matchAll(/\(\s*\d+\s*(?:ft|feet|foot|′|')\s*\d+\s*(?:in|inch|inches|"|″)\s*\)/giu)]
          .some(match => item.start >= match.index && item.end <= match.index + match[0].length)) continue;
        if (ignoreRanges.some(range => item.start >= range.start && item.end <= range.end)) continue;
        ignoreRanges.push(item);
        const suffix = text.slice(item.end);
        const converted = findUnitInParenthetical(suffix);
        const replacements = conversions(item.value, item.unit);
        if (!converted) {
          if (!replacements) continue;
          candidates.push({ start: item.start, end: item.end, message: "Writing for an international audience? Consider adding the metric equivalent.", shortMessage: "Add metric equivalent?",
            suggestions: replacements.map(value => `${item.text} (${value})`) });
          continue;
        }
        if (!converted.unit) continue;
        const fullEnd = item.end + converted.match[0].length;
        // The full conversion is excluded before subsequent unit matches, as
        // in AbstractUnitConversionRule.matchUnits' two-pass ignore ranges.
        ignoreRanges.push({ start: item.end, end: fullEnd });
        if (/\(\s*ca\./iu.test(converted.match[0])) continue;
        if (item.unit.dimension !== converted.unit.dimension) {
          candidates.push({ start: item.start, end: fullEnd, message: "These units don't seem to be compatible.", shortMessage: "Units incompatible.", suggestions: [] });
          continue;
        }
        if (item.unit.factor === converted.unit.factor) continue;
        // LanguageTool compares the difference in the displayed target unit,
        // so its absolute 0.01 tolerance is not applied in a canonical base
        // unit (meters/liters/etc.).
        const expectedInDisplayedUnit = fromBase(toBase(item.value, item.unit), converted.unit);
        if (Math.abs(expectedInDisplayedUnit - converted.value) <= DELTA) continue;
        const inputUnitBase = toBase(item.value, item.unit);
        const sourceMetric = item.unit.metric;
        const replacementValues = sourceMetric ? formatInUnit(fromBase(inputUnitBase, converted.unit), converted.unit)
          : formatList(item.value, item.unit);
        if (sourceMetric) {
          const convertedNumberStart = item.end + converted.match[0].indexOf(converted.match[1]);
          candidates.push({ start: convertedNumberStart, end: convertedNumberStart + converted.match[1].length,
            message: "This unit conversion doesn't seem right. Do you want to correct it automatically?", shortMessage: "Incorrect unit conversion. Correct it?",
            suggestions: replacementValues });
        } else {
          candidates.push({ start: item.start, end: fullEnd, message: "This unit conversion doesn't seem right. Do you want to correct it automatically?", shortMessage: "Incorrect unit conversion. Correct it?",
            suggestions: replacementValues.map(value => `${item.text} (${value})`) });
        }
      }
      return candidates.map((item, index) => ({ id: `METRIC_UNITS_EN_US:${item.start}:${item.end}:${index}`, ruleId: "METRIC_UNITS_EN_US",
        category: "style", severity: "warning", message: item.message, shortMessage: item.shortMessage,
        text: text.slice(item.start, item.end), start: item.start, end: item.end,
        replacementStart: item.start, replacementEnd: item.end, suggestions: item.suggestions,
        _languagePriority: -50, _picky: true }));
    }
  }

  globalThis.CorrectorEnglishUnitConversion = Object.freeze({ EnglishUnitConversion });
})();
