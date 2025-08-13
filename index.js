// rules/no-gif-allowed.js
import { match } from "node:assert";
import { text } from "node:stream/consumers";
import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";

function fixText(text, options) {
  // correct casings
  const user_word_list = options.words;
  const pattern = new RegExp(`\\b(${user_word_list.join("|")})\\b`, "gi");

  const matches = text.match(pattern);

  let correctedText = text;

  if (matches) {
    matches.forEach((match) => {
      // substitute matched incrrect word with user words specified in word list

      correctedText.replace(
        match,
        user_word_list.find(
          (word) => word.toLowerCase() === match.toLowerCase(),
        ),
      );
    });
    return correctedText;
  }
  return;

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

/*
Siccome voglio fare uscire un messaggio per ogni errore
l'apporrcio corrente non va bene perché portei avere più
parole sbagliate nello stesso text node.

quindi fixNode deve ritornare tutto il nodo corretto.
poi in wordCaseRule, confronto nodo corretto con quello sorgente:
  Per ogni differenza, genero un messaggio con file.message

*/

function wordCaseRule(tree, file, options) {
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
    const correctedText = fixText(node.value, options);

    if (!correctedText) {
      return;
    }

    //let message =

    //file.messages.push()

    const msg = file.message(
      `Found "${node.value}" expected "${correctedText}"`,
      node,
    );
    msg.actual = node.value;
    msg.expected = correctedText;
  });
}

const remarkLintWordCase = lintRule("remark-lint:word-case", wordCaseRule);

export default remarkLintWordCase;
