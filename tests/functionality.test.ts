import remarkLintWordCase from "../src/index.ts";
import { expect, test } from "bun:test";
import { remark } from "remark";
import path from "path";
import type { VFile } from "vfile";

const invalidFilePath = path.join(import.meta.dirname, "docs/invalid.md");
const invalidFileContent = await Bun.file(invalidFilePath).text();

test("Complete file", async () => {
  const result:VFile = await remark()
    .use(remarkLintWordCase, {
      words: ["RegEx", "fooBAR"],
    })
    .process(invalidFileContent);
    result.messages.forEach((msg) => {
    console.log(msg.reason, msg.place);
  });
  expect(result.messages.length).toBe(10);
});

test("Heading", async () => {
  const result = await remark()
    .use(remarkLintWordCase, {
      words: ["RegEx", "fooBAR"],
    })
    .process("# this is a foobar test");
  result.messages.forEach((msg) => {
    console.log(msg.reason);
  });

  expect(result.messages.length).toBe(1);
});
