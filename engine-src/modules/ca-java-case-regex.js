/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Portable Java inline case flags at top-level alternative boundaries.
 * Scoped flags and flags inside a branch remain unsupported. */
(() => {
  "use strict";
  function normalizeJavaEscapedPunctuation(source) {
    let output="",classDepth=0,escaped=false,previous="";
    const syntax=new Set("^$\\\\.*+?()[]{}|/");
    const word="[\\p{L}\\p{M}\\p{N}\\p{Pc}]";
    for(let index=0;index<source.length;index++){
      const char=source[index];
      if(escaped){
        if(char==="b"&&classDepth===0)output+=`(?:(?<!${word})(?=${word})|(?<=${word})(?!${word}))`;
        else if(char==="B"&&classDepth===0)output+=`(?:(?<=${word})(?=${word})|(?<!${word})(?!${word}))`;
        else if(char==="b"&&classDepth>0)output+="\\x08";
        else if(/[A-Za-z0-9]/u.test(char)||syntax.has(char)||classDepth>0&&char==="-")output+="\\"+char;
        else output+=char;
        escaped=false;
      }else if(char==="\\")escaped=true;
      else if(char==="["){
        if(classDepth>0){if(previous==="-"||source[index+1]==="^")throw new Error("Unsupported nested Java character-class operation.");classDepth++;}
        else{classDepth=1;output+=char;}
      }else if(char==="]"&&classDepth>1)classDepth--;
      else if(char==="]"&&classDepth===0)output+="\\]";
      else if(char==="$"&&source[index+1]==="?"){output+="(?:$)?";index++;}
      else if(char==="-"&&classDepth>1&&(source[index+1]==="]"||previous==="["||previous==="^"&&source[index-2]==="["))output+="\\-";
      else if(char==="{"&&classDepth===0){
        const quantifier=/^\{\d+(?:,\d*)?\}/u.exec(source.slice(index));
        const unicodeProperty=/\\[pP]$/u.test(output);
        output+=quantifier||unicodeProperty?"{":"\\{";
      }
      else if(char==="}"&&classDepth===0&&!/\{\d+(?:,\d*)?$/u.test(output)&&!/\\[pP]\{[^{}]*$/u.test(output))output+="\\}";
      else{output+=char;if(char==="]"&&classDepth===1)classDepth=0;}
      previous=char;
    }
    if(escaped)output+="\\";
    return output;
  }
  function compile(source, caseSensitive, global = false) {
    // LanguageTool uses (?) as its case-insensitive regex marker.
    source=source.replace(/\(\?\)/gu,"(?i)");
    // Java POSIX Punct is equivalent to the Unicode punctuation category.
    source=source.replace(/\\([pP])\{Punct\}/gu,"\\$1{P}");
    // Java POSIX Alpha denotes Unicode letters.
    source=source.replace(/\\([pP])\{Alpha\}/gu,"\\$1{L}");
    // Java class intersection [A&&[^B]]: preserve it with lookaheads.
    source=source.replace(/\[((?:\\[pP]\{[A-Za-z_]+\})|(?:\\.|[^\\[\]])+)&&\[\^((?:\\.|[^\\[\]])+)\]\]([*+?]|\{\d+(?:,\d*)?\})?/gu,
      (_match, included, excluded, quantifier="") => `(?:(?=[${included}])(?![${excluded}])[\\s\\S])${quantifier}`);
    if (!/\(\?[iu-]+\)/u.test(source)) {const normalized=normalizeJavaEscapedPunctuation(source);return new RegExp(global ? normalized : `^(?:${normalized})$`, `${global ? "g" : ""}${caseSensitive ? "" : "i"}u`);}
    const branches = [];
    let current = "", depth = 0, inClass = false, escaped = false;
    for (const char of source) {
      if (escaped) { current += char; escaped = false; continue; }
      if (char === "\\") { current += char; escaped = true; continue; }
      if (char === "[" && !inClass) inClass = true;
      else if (char === "]" && inClass) inClass = false;
      else if (!inClass && char === "(") depth++;
      else if (!inClass && char === ")") depth--;
      if (char === "|" && depth === 0 && !inClass) { branches.push(current); current = ""; }
      else current += char;
    }
    branches.push(current);
    const compiled = [];
    let inheritedCaseSensitive=caseSensitive;
    for (let branch of branches) {
      branch=normalizeJavaEscapedPunctuation(branch);
      let branchCaseSensitive=inheritedCaseSensitive;
      // Java permits top-level inline flags after a start anchor and allows
      // repeated flags such as (?ii). Translate this portable prefix to JS.
      while (true) {
        const anchor=branch.startsWith("^")?"^":"";
        const prefix=branch.slice(anchor.length).match(/^\(\?([iu-]+)\)/u);
        if(!prefix)break;
        const flags=prefix[1];
        if(!/^(?:i?u?|-i)$/u.test(flags)&&!/^i{2,}u?$/u.test(flags)&&!/^u+i+$/u.test(flags))throw new Error("Unsupported Java inline flags.");
        if(flags.includes("-i"))branchCaseSensitive=true;
        else if(flags.includes("i"))branchCaseSensitive=false;
        branch=anchor+branch.slice(anchor.length+prefix[0].length);
      }
      if (/\(\?[iu-]+\)/u.test(branch) || global && branches.length !== 1) throw new Error("Unsupported scoped Java case flags.");
      compiled.push(new RegExp(global ? branch : `^(?:${branch})$`, `${global ? "g" : ""}${branchCaseSensitive ? "" : "i"}u`));
      // A Java embedded flag group applies to the remainder of its enclosing
      // group, including later top-level alternatives.
      inheritedCaseSensitive=branchCaseSensitive;
    }
    return global ? compiled[0] : { test: value => compiled.some(regex => regex.test(value)) };
  }
  globalThis.CorrectorJavaCaseRegex = Object.freeze({ compile });
})();
