import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";
import type { Literal, Node, Position } from "unist";
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
  position?: Position; // place of error in source document
};

function calcMatchPosition(
  node: TextNode,
  match: string,
  relativeMatchStartIndex: number, // start index of the matched word relative to the beginning of THIS node
): [number, number] | undefined {
  // If node position or offset is missing, return undefined
  if (!node.position || typeof node.position.start.offset !== "number") {
    return undefined;
  }

  // 1. Get the absolute offset of the match start in the document
  const matchStartOffset = node.position.start.offset + relativeMatchStartIndex;

  // 2. Get the absolute offset of the match end in the document
  const matchEndOffset = matchStartOffset + match.length;

  // 3. Create a location utility for this node's value and position
  //    (location expects the whole file text, but we can use file.location in the rule if needed)
  //    Here, we assume the location function is available and can convert offsets to points
  //    We'll use the file's location utility in the rule, but for this function, we just return offsets

  // 4. Return a Position object with start and end offsets
  return [matchStartOffset, matchEndOffset];
}

function lintText(
  node: TextNode,
  options: remarkLintWordCaseOptions,
): lintResult[] {
  // linting one text node may return more than one error, so we collect them all and return them in block

  let results: lintResult[] = [];

  const user_word_list = options.words;
  const pattern = new RegExp(`\\b(${user_word_list.join("|")})\\b`, "gi");

  const matches = node.value.match(pattern);

  // let correctedText = node.value;

  if (matches) {
    let replacement: string | undefined;

    matches.forEach((match) => {
      replacement = user_word_list.find(
        (word) => word.toLowerCase() === match.toLowerCase(),
      );
      if (replacement) {
        // maybe replacing correct text in node is unneeded, probably is
        /* correctedText = correctedText.replace(
          new RegExp(`\\b${match}\\b`, "g"),
          replacement, 
          
        );*/

        results.push({
          expected: replacement.trim(),
          actual: match.trim(),

          // calculate position of single match
          position: calcMatchPosition(node, match, node.value.indexOf(match)),
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
      msg.place = {
        start: location(file.value).toPoint(res.position?.start.offset) ?? 0,
        end: location(file.value).toPoint(res.position?.end.offset) ?? 0,
      };
    });
  });
}

const remarkLintWordCase = lintRule("remark-lint:word-case", wordCaseRule);

export default remarkLintWordCase;
