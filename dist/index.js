// src/index.ts
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { location } from "vfile-location";
var RULE_ID = "word-case";
var SOURCE_ID = `remark-lint:${RULE_ID}`;
var ERRORS = {
  OPTIONS_UNDEFINED: "Options must include a `words` key.",
  OPTIONS_INVALID: "`words` must be a non-empty array of unique string values."
};
function wordCaseRule(tree, file, options) {
  if (!options?.words) {
    file.fail(ERRORS.OPTIONS_UNDEFINED, undefined, SOURCE_ID);
  }
  if (!Array.isArray(options.words) || options.words.length === 0 || options.words.some((word) => typeof word !== "string")) {
    file.fail(ERRORS.OPTIONS_INVALID, undefined, SOURCE_ID);
  }
  const caseMap = new Map(options.words.map((word) => [word.toLowerCase(), word]));
  const pattern = new RegExp(`\\b(${options.words.join("|")})\\b`, "gi");
  const loc = location(file);
  visit(tree, "text", (node) => {
    if (!node.position?.start?.offset) {
      return;
    }
    const nodeStartOffset = node.position.start.offset;
    let match;
    while ((match = pattern.exec(node.value)) !== null) {
      const actual = match[0];
      const lowercasedActual = actual.toLowerCase();
      const expected = caseMap.get(lowercasedActual);
      if (expected && expected !== actual) {
        const wordStartIndex = match.index;
        const wordStartOffset = nodeStartOffset + wordStartIndex;
        const wordEndOffset = wordStartOffset + actual.length;
        const start = loc.toPoint(wordStartOffset);
        const end = loc.toPoint(wordEndOffset);
        const message = file.message(`Incorrect word case. Expected \`${expected}\` but found \`${actual}\``, { start, end }, `${SOURCE_ID}:${RULE_ID}`);
        message.expected = [expected];
        message.actual = actual;
      }
    }
  });
}
var remarkLintWordCase = lintRule(SOURCE_ID, wordCaseRule);
var src_default = remarkLintWordCase;
export {
  src_default as default,
  ERRORS
};

//# debugId=C716057062C8CA9F64756E2164756E21
//# sourceMappingURL=index.js.map
