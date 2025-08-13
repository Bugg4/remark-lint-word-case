import remarkLintWordCase from "../src/index.ts";
import { remarkLintWordCaseError } from "../src/index.ts";
import { expect, test } from "bun:test";
import { remark } from "remark";
import { VFile } from "vfile";

test("Catch undefined options", async () => {
  const result: VFile = await remark()
    .use(remarkLintWordCase)
    .process("## This should fail because of invalid options");

  expect(result.messages.length > 0).toBe(true);
  expect(result.messages[0].reason).toBe(
    remarkLintWordCaseError.OPTIONS_UNDEFINED,
  );
});

test("Catch invalid options", async () => {
  const result: VFile = await remark()
    .use(remarkLintWordCase, {
      words: [1, 2, 3],
    })
    .process("## This should fail because of invalid options");

  expect(result.messages.length > 0).toBe(true);
  expect(result.messages[0].reason).toBe(
    remarkLintWordCaseError.OPTIONS_INVALID,
  );
});
