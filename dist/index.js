// src/index.ts
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { location } from "vfile-location";
var remarkLintWordCaseError;
((remarkLintWordCaseError2) => {
  remarkLintWordCaseError2["_OPTIONS_PREFIX"] = "Invalid options:";
  remarkLintWordCaseError2["OPTIONS_UNDEFINED"] = "Invalid options: options must include `words:` key.";
  remarkLintWordCaseError2["OPTIONS_INVALID"] = "Invalid options: 'words' must be a non-empty array of strings.";
})(remarkLintWordCaseError ||= {});
function lintText(node, options) {
  const results = [];
  const { words } = options;
  const pattern = new RegExp(`\\b(${words.join("|")})\\b`, "gi");
  let match;
  while ((match = pattern.exec(node.value)) !== null) {
    const actual = match[0];
    const expected = words.find((word) => word.toLowerCase() === actual.toLowerCase());
    if (expected && expected !== actual) {
      results.push({
        expected,
        actual,
        index: match.index
      });
    }
  }
  return results;
}
function wordCaseRule(tree, file, options) {
  if (!options) {
    throw new Error("Invalid options: options must include `words:` key." /* OPTIONS_UNDEFINED */);
  }
  if (!Array.isArray(options.words) || options.words.length === 0 || options.words.some((word) => typeof word !== "string")) {
    throw new Error("Invalid options: 'words' must be a non-empty array of strings." /* OPTIONS_INVALID */);
  }
  const loc = location(file);
  visit(tree, "text", (node) => {
    if (!node.position || !node.position.start.offset) {
      return;
    }
    const nodeStartOffset = node.position.start.offset;
    const results = lintText(node, options);
    results.forEach((res) => {
      const wordStartOffset = nodeStartOffset + res.index;
      const wordEndOffset = wordStartOffset + res.actual.length;
      const start = loc.toPoint(wordStartOffset);
      const end = loc.toPoint(wordEndOffset);
      if (!start || !end) {
        throw new Error("undefined start or end point");
      }
      const wordPosition = {
        start,
        end
      };
      const msg = file.message(`Incorrect word case. Expected \`${res.expected}\` but found \`${res.actual}\``, wordPosition);
      msg.expected = [res.expected];
      msg.actual = res.actual;
      msg.source = "remark-lint-word-case";
      msg.ruleId = "word-case";
    });
  });
}
var remarkLintWordCase = lintRule("remark-lint:word-case", wordCaseRule);
var src_default = remarkLintWordCase;
export {
  remarkLintWordCaseError,
  src_default as default
};
//# debugId=5EC409693B1B5FA064756E2164756E21
