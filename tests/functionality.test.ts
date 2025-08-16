import remarkLintWordCase from "../src/index.ts";
import { expect, test } from "bun:test";
import { remark } from "remark";
import path from "path";
import type { VFile } from "vfile";
import { reporter } from "vfile-reporter";

const invalidFilePath = path.join(import.meta.dirname, "docs/invalid.md");
const invalidFileContent = await Bun.file(invalidFilePath).text();

test("Complete file", async () => {
  const result: VFile = await remark()
    .use(remarkLintWordCase, {
      words: ["RegEx", "fooBAR"],
    })
    .process(invalidFileContent);

  result.path = invalidFilePath;

  if (Bun.env.LOGGING) {
    console.log(reporter(result));
  }

  expect(result.messages.length).toBe(13);
});

test("Heading", async () => {
  const result = await remark()
    .use(remarkLintWordCase, {
      words: ["RegEx", "fooBAR"],
    })
    .process("# this is a foobar test");

  if (Bun.env.LOGGING) {
    console.log(reporter(result));
  }
  expect(result.messages.length).toBe(1);
});
