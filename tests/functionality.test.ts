import { expect, test } from "bun:test";
import path from "path";
import { remark } from "remark";
import type { VFile } from "vfile";
import { reporter } from "vfile-reporter";
import remarkLintWordCase from "../src/index.ts";
import { NonEmptyArray } from "../src/utils.ts";

const invalidFilePath = path.join(import.meta.dirname, "docs/invalid.md");
const invalidFileContent = await Bun.file(invalidFilePath).text();

test("Complete file", async () => {
  const WORDS: NonEmptyArray<string> = ["RegEx", "fooBAR"];

  const result: VFile = await remark()
    .use(remarkLintWordCase, {
      words: WORDS,
    })
    .process(invalidFileContent);

  result.path = invalidFilePath;

  if (Bun.env.DEBUG) {
    console.log(reporter(result));
  }

  // asser correct warnign quantity
  expect(result.messages.length).toBe(13);

  const WORDS_LC = WORDS.map((w) => w.toLocaleLowerCase());

  // Assert that we're only matching words that are inside the wordlist
  result.messages.forEach((m) => {
    expect(m.actual);

    if (m.actual) {
      expect(WORDS_LC.includes(m.actual.toLocaleLowerCase())).toBe(true);
    }
  });
});

test("Heading", async () => {
  const result = await remark()
    .use(remarkLintWordCase, {
      words: ["RegEx", "fooBAR"],
    })
    .process("# this is a foobar test");

  if (Bun.env.DEBUG) {
    console.log(reporter(result));
  }
  //correct quantity
  expect(result.messages.length).toBe(1);

  expect(result.messages[0].actual).toBe("foobar");
  expect(result.messages[0].expected?.at(0)).toBe("fooBAR");
});

test("Block Quote", async () => {
  const result = await remark().use(remarkLintWordCase, {
    words: ["fooBAR"],
  }).process(`> this is a foobar blockquote  
on multiple lines, foobar!
>
>
> foobar
      `);

  if (Bun.env.DEBUG) {
    console.log(reporter(result));
  }
  //correct quantity
  expect(result.messages.length).toBe(3);

  result.messages.forEach((m) => {
    expect(m.actual).toBe("foobar");
    expect(m.expected?.at(0)).toBe("fooBAR");
  });
});
