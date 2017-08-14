/**
 * Resprents a response, seperated by language and code contents.
 *
 * @interface ParseResponse
 */
interface ParsedResponse {
    language: string;
    code: string;
}

const TRIPLE_CODE_BLOCK = /```\w+[\s\S]+```/gm;
const TRIPLE_LANGUAGE_POSITIONS = /\w+(?!```)\w+/;

function parseTripleCode(message: string): ParsedResponse {
    const firstLine = message.split(/\r?\n/)[0];
    const maybeLanguage = firstLine.match(TRIPLE_LANGUAGE_POSITIONS);
    if (maybeLanguage == null) {
        throw new TypeError('No language given!');
    }
    const language = maybeLanguage[0];

    const maybeCode = message.match(TRIPLE_CODE_BLOCK);
    if (maybeCode == null) {
        throw new TypeError('No code given!');
    }
    const uncleanCode = maybeCode[0].replace(/```\w*/, '');
    const code = uncleanCode.slice(0, uncleanCode.length - 3);

    return {
        code,
        language,
    };
}

const SINGLE_CODE_BLOCK = /`[\s\S]+`/gm;

/**
 * Converts a string form into an object to be sent to the api.
 * the string can either be:
 *
 * e!run js 10 + 20
 *
 * e!run js `10 + 20`
 *
 * e!run ```js
 * 10 + 20
 * ```
 *
 * @param {string} message
 * @returns {(ParsedResponse | undefined)}
 */
function parseCode(message: string): ParsedResponse {
    // if (TRIPLE_CODE_BLOCK.test(message)) {
        return parseTripleCode(message);
    // } else if (SINGLE_CODE_BLOCK.test(message)) {

    // }
}

export { parseCode };
