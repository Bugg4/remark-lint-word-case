import type { Node } from "unist";
import type { NonEmptyArray } from "./utils";
export type RemarkLintWordCaseOptions = {
    words: NonEmptyArray<string>;
};
export declare const ERRORS: {
    readonly OPTIONS_UNDEFINED: "Options must include a `words` key.";
    readonly OPTIONS_INVALID: "`words` must be a non-empty array of unique string values.";
};
declare const remarkLintWordCase: import("unified-lint-rule").Plugin<Node, RemarkLintWordCaseOptions>;
export default remarkLintWordCase;
