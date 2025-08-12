// rules/no-gif-allowed.js
import { match } from "node:assert";
import { text } from "node:stream/consumers";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";

function fixNode(node, file, options) {
  // correct casings
  const user_word_list = options.words;

  //console.log(user_word_list);

  // create pattern to match all words in the list with any casing
  // regex to match a list words, case insenstive, allow adjacent punctuation before and after:
  const pattern = new RegExp(`\\b(${user_word_list.join("|")})\\b`, "gi");

  const matches = node.value.match(pattern);

  if (matches) {
    matches.forEach((match) => {
      node.actual = match;
      node.expected = user_word_list.find(
        (word) => word.toLowerCase() === match.toLowerCase(),
      );
      node.file = file;
      
      file.message("Wrong word case", node);
    });
  }

  //let results = [];

  /*   if (matches) {
    matches.forEach((match, i) => {
      const result = {
        found: match,
        at: node.position,
        expected: user_word_list.find(
          (word) => word.toLowerCase() === match.toLowerCase(),
        ),
      };

      if (result.found !== result.expected) {
        results.push(result);
      }
    });
  }

  return results; */
}

function wordCaseRule(tree, file, options = {}) {
  // check options are valid
  if (!options) {
    file.message("The `words` option is required.", options);
    return;
  }

  if (!Array.isArray(options.words) || options.words.length === 0) {
    file.message("The `words` option must be a non-empty array", options);
    return;
  }

  if (options.words.some((word) => typeof word !== "string")) {
    file.message("All items in the `words` array must be strings", options);
    return;
  }

  // https://github.com/syntax-tree/mdast?tab=readme-ov-file#nodes
  // blockquote break code definition emphasis heading html image imageReference inlineCode link linkReference list listItem paragraph root strong text thematicBreak
  visit(tree, "text", (node) => {
    // console.log(node);
    const corrections = fixNode(node, file, options);

    if (!corrections || corrections.length === 0) {
      return;
    }

    corrections.forEach((corr) => {
      file.message("Incorrect word case", node);
    });
  });
}

const remarkLintWordCase = lintRule("remark-lint:word-case", wordCaseRule);

export default remarkLintWordCase;
