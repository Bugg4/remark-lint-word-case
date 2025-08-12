// rules/no-gif-allowed.js
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";

function checkWord(node, options){
    const words = options.words;

    console.log(words);

      const regex = new RegExp(`\\b(${words.join("|")})\\b`, "g");
      const matches = node.value.match(regex);

      if (matches) {
        matches.forEach((word) => {
          if (word !== word.toLowerCase()) {
            file.message(`Incorrect casing for word: "${word}"`, node);
          }
        });
      }
}

const remarkLintWordCase = lintRule(
  "remark-lint-word-case: ",
  function (tree, file, options) {
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

    visit(tree, "text", checkWord);
  }
);

export default remarkLintWordCase;
