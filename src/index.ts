import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";
import type { Literal, Node, Position } from "unist";
import type { Rule } from "unified-lint-rule";
import type { VFileMessage } from "vfile-message";
import { location } from "vfile-location";

type NonEmptyArray<T> = [T, ...T[]];

export type remarkLintWordCaseOptions = {
  words: NonEmptyArray<string>;
};

export enum remarkLintWordCaseError {
  _OPTIONS_PREFIX = "Invalid options:",
  OPTIONS_UNDEFINED = `${remarkLintWordCaseError._OPTIONS_PREFIX} options must include \`words:\` key.`,
  OPTIONS_INVALID = `${remarkLintWordCaseError._OPTIONS_PREFIX} 'words' must be a non-empty array of strings.`,
}

interface TextNode extends Literal {
  type: "text";
  value: string;
  // A TextNode has a position if it's generated from a source file
  position?: Position;
}

// This result now includes the index within the node's value string
type LintResult = {
  expected: string;
  actual: string;
  index: number; // The starting index of the 'actual' word within the node's text
};

/**
 * Lints a single text node and returns a result for each incorrect word found.
 */
function lintText(
  node: TextNode,
  options: remarkLintWordCaseOptions,
): LintResult[] {
  const results: LintResult[] = [];
  const { words } = options;
  const pattern = new RegExp(`\\b(${words.join("|")})\\b`, "gi");

  let match;
  // Use `exec` in a loop to get the index of each match
  while ((match = pattern.exec(node.value)) !== null) {
    const actual = match[0]; // The matched word (e.g., "javascript")

    // Find the correctly-cased version from the user's list
    const expected = words.find(
      (word) => word.toLowerCase() === actual.toLowerCase(),
    );

    // Only report an error if the casing is actually wrong
    if (expected && expected !== actual) {
      results.push({
        expected,
        actual,
        index: match.index, // The starting position of the match in `node.value`
      });
    }
  }

  return results;
}

/**
 * The main linting rule function.
 */
function wordCaseRule(
  tree: Node,
  file: VFile,
  options: remarkLintWordCaseOptions,
) {
  // --- Option validation ---
  if (!options) {
    throw new Error(remarkLintWordCaseError.OPTIONS_UNDEFINED);
  }
  if (
    !Array.isArray(options.words) ||
    options.words.length === 0 ||
    options.words.some((word) => typeof word !== "string")
  ) {
    throw new Error(remarkLintWordCaseError.OPTIONS_INVALID);
  }
  // --- End validation ---

  const loc = location(file); // Create a location service for the file

  visit(tree, "text", (node: TextNode) => {
    // A node might not have a position if it was created programmatically
    if (!node.position || !node.position.start.offset) {
      return;
    }
    const nodeStartOffset = node.position.start.offset;

    const results = lintText(node, options);

    // For each incorrect word found, calculate its precise position and create a message
    results.forEach((res) => {
      // Calculate the word's absolute start and end offsets in the file
      const wordStartOffset = nodeStartOffset + res.index;
      const wordEndOffset = wordStartOffset + res.actual.length;

      // Convert offsets to {line, column} points
      const start = loc.toPoint(wordStartOffset);
      const end = loc.toPoint(wordEndOffset);

      if (!start || !end) {
        throw new Error("undefined start or end point");
      }

      const wordPosition: Position = {
        start: start,
        end: end,
      };

      const msg: VFileMessage = file.message(
        `Incorrect word case. Expected \`${res.expected}\` but found \`${res.actual}\``,
        wordPosition, // Use the calculated position of the specific word
      );

      msg.expected = [res.expected];
      msg.actual = res.actual;
      msg.source = "remark-lint-word-case"; // Good practice to name your rule
      msg.ruleId = "word-case";
    });
  });
}

const remarkLintWordCase = lintRule("remark-lint:word-case", wordCaseRule);

export default remarkLintWordCase;
