import remarkLintWordCase from '../index.js'
import assert from 'node:assert/strict'
import test from 'node:test'
import { remark } from 'remark'
import fs from 'fs'
import path from 'path'

const invalidFilePath = path.join(import.meta.dirname, 'invalid.md')
const invalidFileContent = fs.readFileSync(invalidFilePath, 'utf-8')

test('[A] first test', async () => {
  const result = await remark()
    .use(remarkLintWordCase, {
        words:["RegEx", "fooBAR"]
    })
    .process(invalidFileContent)
  // assert.strictEqual(result.messages.length, 1)
  console.log(result.messages)
})