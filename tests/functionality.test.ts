import remarkLintWordCase from "../src/index.ts";
import { expect, test } from "bun:test";
import { remark } from "remark";
import path from "path";
import { VFile } from "vfile";

const invalidFilePath = path.join(import.meta.dirname, "docs/invalid.md");
const invalidFileContent = await Bun.file(invalidFilePath).text();

test("Complete file", async () => {
  const result: VFile = await remark()
    .use(remarkLintWordCase, {
      words: ["RegEx", "fooBAR"],
    })
    .process(invalidFileContent);
  expect(result.messages.length).toBe(5);
});

test("Heading", async () => {
  const result: VFile = await remark()
    .use(remarkLintWordCase, {
      words: ["RegEx", "fooBAR"],
    })
    .process("# this is a foobar test");
  expect(result.messages.length).toBe(1);
});