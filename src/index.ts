import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";
import type { Node } from "unist";

type NonEmptyArray<T> = [T, ...T[]];

export type remarkLintWordCaseOptions = {
  words: NonEmptyArray<string>;
};

export enum remarkLintWordCaseError {
  _OPTIONS_PREFIX = "Invalid options:",
  OPTIONS_UNDEFINED = `${remarkLintWordCaseError._OPTIONS_PREFIX} options must include \`words:\` key.`,
  OPTIONS_INVALID = `${remarkLintWordCaseError._OPTIONS_PREFIX} 'words' must be a non-empty array of strings.`,
}

interface TextNode extends Node {
  type: "text";
  value: string;
  position?: any;
}

function fixText(
  text: string,
  options: remarkLintWordCaseOptions,
): string | undefined {
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

  const user_word_list = options.words;
  const pattern = new RegExp(`\\b(${user_word_list.join("|")})\\b`, "gi");

  const matches = text.match(pattern);

  let correctedText = text;

  if (matches) {
    let replacement: string | undefined;
    matches.forEach((match) => {
      replacement = user_word_list.find(
        (word) => word.toLowerCase() === match.toLowerCase(),
      );
      if (replacement) {
        correctedText = correctedText.replace(
          new RegExp(`\\b${match}\\b`, "g"),
          replacement,
        );
      }
    });
    return correctedText;
  }
  return;
}

function wordCaseRule(
  tree: Node,
  file: VFile,
  options: remarkLintWordCaseOptions,
) {

  visit(tree, "text", (node: TextNode) => {
    const correctedText = fixText(node.value, options);

    if (!correctedText || correctedText === node.value) {
      return;
    }

    const msg = file.message(
      `Found "${node.value}" expected "${correctedText}"`,
      node,
    );
    msg.actual = node.value;
    msg.expected = [correctedText];
  });
}

const remarkLintWordCase = lintRule("remark-lint:word-case", wordCaseRule);

export default remarkLintWordCase;
