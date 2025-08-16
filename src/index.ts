import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";
import type { Literal, Node, Position, Point } from "unist";
import type { Rule } from "unified-lint-rule";
import type { VFileMessage } from "vfile-message";
import { location } from "vfile-location";
import type { Location } from "vfile-location";

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
}

type lintResult = {
  expected: string; // expecyed text value
  actual: string; // actual text value
  place: Position | Point
};

function calcWordPosition(
  node: TextNode,
  word: string,
  index: number, // start index of the matched word relative to the beginning of THIS node
): Position {
  // todo
}

function lintText(
  node: TextNode,
  options: remarkLintWordCaseOptions,
): lintResult[] {
  // linting one text node may return more than one error, so we collect them all and return them in block

  let results: lintResult[] = [];

  const user_word_list = options.words;
  const pattern = new RegExp(`\\b(${user_word_list.join("|")})\\b`, "gi"); // match globally, case insenstive

  const matches = node.value.match(pattern);

  // NOTE:
  // In matches we could have duplicate words but at different positions in the node 

  if (matches) {
    let replacement: string | undefined;

    matches.forEach((match) => {
      replacement = user_word_list.find(
        (word) => word.toLowerCase() === match.toLowerCase(),
      );
      if (replacement) {
        // build a result, and push it to results array.
        results.push({
          expected: replacement.trim(),
          actual: match.trim(),
          position: // todo
        });
      }
    });
  }

  return results;
}

function wordCaseRule(
  tree: Node,
  file: VFile,
  options: remarkLintWordCaseOptions,
) {
  // check options at runtime
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

  // visit AST nodes
  visit(tree, "text", (node: TextNode) => {
    const results = lintText(node, options);

    results.forEach((res) => {
      let msg: VFileMessage = file.message(
        `Word case error. Expected \`${res.expected}\` found \`${res.actual}\``,
        node,
      );

      msg.expected = [res.expected.trim()];
      msg.actual = res.actual;
      msg.place = res.place
    });
  });
}

const remarkLintWordCase = lintRule("remark-lint:word-case", wordCaseRule);

export default remarkLintWordCase;
