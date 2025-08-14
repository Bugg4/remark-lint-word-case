// src/index.ts
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
var remarkLintWordCaseError;
((remarkLintWordCaseError2) => {
  remarkLintWordCaseError2["_OPTIONS_PREFIX"] = "Invalid options:";
  remarkLintWordCaseError2["OPTIONS_UNDEFINED"] = "Invalid options: options must include `words:` key.";
  remarkLintWordCaseError2["OPTIONS_INVALID"] = "Invalid options: 'words' must be a non-empty array of strings.";
})(remarkLintWordCaseError ||= {});
function fixText(text, options) {
  if (!options) {
    throw new Error("Invalid options: options must include `words:` key." /* OPTIONS_UNDEFINED */);
  }
  if (!Array.isArray(options.words) || options.words.length === 0 || options.words.some((word) => typeof word !== "string")) {
    throw new Error("Invalid options: 'words' must be a non-empty array of strings." /* OPTIONS_INVALID */);
  }
  const user_word_list = options.words;
  const pattern = new RegExp(`\\b(${user_word_list.join("|")})\\b`, "gi");
  const matches = text.match(pattern);
  let correctedText = text;
  if (matches) {
    let replacement;
    matches.forEach((match) => {
      replacement = user_word_list.find((word) => word.toLowerCase() === match.toLowerCase());
      if (replacement) {
        correctedText = correctedText.replace(new RegExp(`\\b${match}\\b`, "g"), replacement);
      }
    });
    return correctedText;
  }
  return;
}
function wordCaseRule(tree, file, options) {
  visit(tree, "text", (node) => {
    const correctedText = fixText(node.value, options);
    if (!correctedText || correctedText === node.value) {
      return;
    }
    const msg = file.message(`Word case error. Expected \`${correctedText.trim()}\` found \`${correctedText.trim()}\``, node);
    msg.actual = node.value;
    msg.expected = [correctedText];
  });
}
var remarkLintWordCase = lintRule("remark-lint:word-case", wordCaseRule);
var src_default = remarkLintWordCase;
export {
  remarkLintWordCaseError,
  src_default as default
};

//# debugId=795A60F76A4B76D964756E2164756E21
//# sourceMappingURL=index.js.map
