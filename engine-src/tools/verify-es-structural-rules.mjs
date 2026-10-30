/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
vm.runInThisContext(await readFile(resolve(root, "engine-src/modules/es-structural-rules.js"), "utf8"));
vm.runInThisContext(await readFile(resolve(root, "engine-src/modules/es-text.js"), "utf8"));
const check = globalThis.CorrectorSpanishStructuralRules.checkText;
const segments = text => globalThis.CorrectorSpanishText.tokenize(text).length ? [{ text, start: 0 }] : [];
const cases = [
  { text: "Dos  espacios", expected: [["WHITESPACE_RULE", 3, 5, [" "]]] },
  { text: "Dos\tcolumnas", expected: [] },
  { text: "Dos\n\nespacios", expected: [] },
  { text: "Hola.. mundo", expected: [["DOUBLE_PUNCTUATION", 4, 6, [".", "…"]], ["UPPERCASE_SENTENCE_START", 7, 12, ["Mundo"]]] },
  { text: "Hola... mundo", expected: [] },
  { text: "Hola. mundo", sentenceSegments: [{ text: "Hola.", start: 0 }, { text: "mundo", start: 6 }], expected: [["UPPERCASE_SENTENCE_START", 6, 11, ["Mundo"]]] },
  { text: "Hola,, mundo", expected: [["DOUBLE_PUNCTUATION", 4, 6, [","]]] },
  { text: "Es una elipsis...", expected: [] },
  { text: "A  B", expected: [["WHITESPACE_RULE", 1, 3, [" "]]] },
  { text: "😀  texto", expected: [["WHITESPACE_RULE", 2, 4, [" "]]] },
  { text: "Hola. Mundo.", expected: [] },
  { text: "hola mundo.", expected: [["UPPERCASE_SENTENCE_START", 0, 4, ["Hola"]]] },
  { text: "¿esto funciona?", expected: [["UPPERCASE_SENTENCE_START", 1, 5, ["Esto"]]] },
  { text: "eBay funciona.", expected: [] },
  { text: "a) elemento de lista", expected: [] },
  { text: "«Hola.» mundo.", sentenceSegments: [{ text: "«Hola.»", start: 0 }, { text: "mundo.", start: 8 }], expected: [["UPPERCASE_SENTENCE_START", 8, 13, ["Mundo"]]] },
  { text: "Ha ilustrado ‘El Hobbit’, ‘El Señor de los Anillos‘ y ‘Los hijos de Húrin’.", sentenceSegments: [{ text: "Ha ilustrado ‘El Hobbit’, ‘El Señor de los Anillos‘ y ‘Los hijos de Húrin’.", start: 0 }], expected: [] },
  { text: "\"Muchas gracias!\".", sentenceSegments: [{ text: "\"Muchas gracias!", start: 0 }, { text: "\".", start: 16 }], expected: [] },
  { text: "“importante y qué pasa.", sentenceSegments: [{ text: "“importante y qué pasa.", start: 0 }], expected: [["ES_UNPAIRED_BRACKETS", 0, 1, ["“”", ""]], ["UPPERCASE_SENTENCE_START", 1, 11, ["Importante"]]] },
  { text: "El término,aparece más tarde.", expected: [["COMMA_PARENTHESIS_WHITESPACE", 10, 18, [", aparece"]]] },
  { text: "El término , aparece más tarde.", expected: [["COMMA_PARENTHESIS_WHITESPACE", 10, 12, [","]]] },
  { text: "( texto )", expected: [["COMMA_PARENTHESIS_WHITESPACE", 0, 2, ["("]], ["COMMA_PARENTHESIS_WHITESPACE", 7, 9, [")"]]] },
  { text: "(texto), 1,234", expected: [] },
  { text: "12° 30' 15\" norte.", expected: [] },
  { text: "¿ Qué quieres?", expected: [["INCORRECT_SPACES", 0, 5, ["¿Qué"]]] },
  { text: "¿Qué quieres ?", expected: [["INCORRECT_SPACES", 5, 14, ["quieres?"]]] },
  { text: "¿Quién viene mañana.", sentenceSegments: [{ text: "¿Quién viene mañana.", start: 0 }], expected: [["ES_INITIAL_QUESTION_MARK", 19, 20, ["?"]]] },
  { text: "¡Qué bonito.", sentenceSegments: [{ text: "¡Qué bonito.", start: 0 }], expected: [["ES_INITIAL_QUESTION_MARK", 11, 12, ["!"]]] },
  { text: "¿Qué quieres?", expected: [] },
  { text: "¿Vamos? sí, claro.", sentenceSegments: [{ text: "¿Vamos? sí, claro.", start: 0 }], expected: [["CAPITALIZATION_AFTER_QUESTION_MARK", 6, 10, ["? Sí", "?, sí"]]] },
  { text: "palabra palabra", sentenceSegments: [{ text: "palabra palabra", start: 0, tokens: [{ text: "palabra", kind: "word", start: 0, end: 7, readings: [] }, { text: "palabra", kind: "word", start: 8, end: 15, readings: [] }] }], expected: [["UPPERCASE_SENTENCE_START", 0, 7, ["Palabra"]], ["SPANISH_WORD_REPEAT_RULE", 0, 15, ["palabra"]]] },
  { text: "muy muy", sentenceSegments: [{ text: "muy muy", start: 0, tokens: [{ text: "muy", kind: "word", start: 0, end: 3, readings: [{ tag: "_allow_repeat" }] }, { text: "muy", kind: "word", start: 4, end: 7, readings: [] }] }], expected: [["UPPERCASE_SENTENCE_START", 0, 3, ["Muy"]]] }
];
const results = cases.map(({ text, expected, sentenceSegments }) => {
  const actual = check(text, { sentenceSegments: sentenceSegments ?? segments(text) }).map(issue => [issue.ruleId, issue.start, issue.end, issue.suggestions]);
  return { text, passed: JSON.stringify(actual) === JSON.stringify(expected), expected, actual };
});
console.log(JSON.stringify({ checked: results.length, passed: results.filter(result => result.passed).length, cases: results, okay: results.every(result => result.passed) }, null, 2));
if (results.some(result => !result.passed)) throw new Error("Spanish structural rules smoke check failed.");
