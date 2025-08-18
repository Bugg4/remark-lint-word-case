import { lintRule } from "unified-lint-rule";
import type { Literal, Node, Position } from "unist";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";
import { location } from "vfile-location";
import type { NonEmptyArray } from "./utils";


export type RemarkLintWordCaseOptions = {
  words: NonEmptyArray<string>;
};

interface TextNode extends Literal {
  type: "text";
  value: string;
  position?: Position;
}


const RULE_ID = "word-case";
const SOURCE_ID = `remark-lint:${RULE_ID}`;

export const ERRORS = {
  OPTIONS_UNDEFINED: "Options must include a `words` key.",
  OPTIONS_INVALID: "`words` must be a non-empty array of unique string values.",
} as const;


function wordCaseRule(
  tree: Node,
  file: VFile,
  options: RemarkLintWordCaseOptions,
) {
  // Runtime option validation
  if (!options?.words) {
    file.fail(ERRORS.OPTIONS_UNDEFINED, undefined, SOURCE_ID);
  }
  if (
    !Array.isArray(options.words) ||
    options.words.length === 0 ||
    options.words.some((word) => typeof word !== "string")
  ) {
    file.fail(ERRORS.OPTIONS_INVALID, undefined, SOURCE_ID);
  }

  // This map allows us to instantly find the correct casing for a given lowercase word.
  const caseMap = new Map(
    options.words.map((word) => [word.toLowerCase(), word]),
  );

  // Compile RegEx pattern (once per file)
  const pattern = new RegExp(`\\b(${options.words.join("|")})\\b`, "gi");
  const loc = location(file);

  visit(tree, "text", (node: TextNode) => {
    // A node might not have a position if it was created programmatically.
    if (!node.position?.start?.offset) {
      return;
    }
    const nodeStartOffset = node.position.start.offset;

    let match;
    // Use the pre-compiled regex pattern to find all matches.
    while ((match = pattern.exec(node.value)) !== null) {
      const actual = match[0];
      const lowercasedActual = actual.toLowerCase();

      // Use the map to find the expected casing.
      const expected = caseMap.get(lowercasedActual);

      // Only report an error if the casing is incorrect.
      if (expected && expected !== actual) {
        const wordStartIndex = match.index;
        const wordStartOffset = nodeStartOffset + wordStartIndex;
        const wordEndOffset = wordStartOffset + actual.length;

        // Convert offsets to {line, column} points.
        const start = loc.toPoint(wordStartOffset);
        const end = loc.toPoint(wordEndOffset);

        // Create VFile message.
        const message = file.message(
          `Incorrect word case. Expected \`${expected}\` but found \`${actual}\``,
          { start, end } as Position,
          `${SOURCE_ID}:${RULE_ID}`,
        );

        // These fields allow the plugin to automatically fix files when remark is called with `--output` option
        message.expected = [expected];
        message.actual = actual;
      }
    }
  });
}

const remarkLintWordCase = lintRule(SOURCE_ID, wordCaseRule);

export default remarkLintWordCase;
