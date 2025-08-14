import type { Node } from "unist";
type NonEmptyArray<T> = [T, ...T[]];
export type remarkLintWordCaseOptions = {
    words: NonEmptyArray<string>;
};
export declare enum remarkLintWordCaseError {
    _OPTIONS_PREFIX = "Invalid options:",
    OPTIONS_UNDEFINED = "Invalid options: options must include `words:` key.",
    OPTIONS_INVALID = "Invalid options: 'words' must be a non-empty array of strings."
}
declare const remarkLintWordCase: import("unified-lint-rule").Plugin<Node, remarkLintWordCaseOptions>;
export default remarkLintWordCase;
