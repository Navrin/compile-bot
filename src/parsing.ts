const minimist = require('minimist-string');

/**
 * Spooky regex.
 * Be scared! 👻
 */
const CODE_AND_LANG_ONLY = /(\w+|`{1,3}[\s\S]+`{1,3})(\s+(.+|`{1,3}[\s\S]+`{1,3}))?$/;
const LANG_POSITION = /(^[a-z]+)|```([a-z]+)$/im;
const CODE_BLOCK = /`{1,3}([\s\S]+)`{1,3}/m;
const TRIPLE_BLOCK_CLEAN = /\w*\s*```(\w*)/m;

export interface Options {
    /**
     * Language option, can be the actual language or an alias.
     *
     * @type {string}
     * @memberof Options
     */
    language: string;
    /**
     * Optional shell command to be executed. Run command must be explicitly given.
     *
     * @type {string}
     * @memberof Options
     */
    shell?:   string;
    /**
     * Filename, default is main.langextention
     *
     * @type {string}
     * @memberof Options
     */
    file?:    string;
    /**
     * The actual code to be sent to glot.io and executed
     *
     * @type {string}
     * @memberof Options
     */
    code:     string;
    /**
     * Optional stdin argument, to mock fake input events
     *
     * @type {string}
     * @memberof Options
     */
    input?:   string;
    /**
     * Specify what version of a language the user wants to run their code in.
     * By default, use the latest version.
     *
     * @type {string}
     * @memberof Options
     */
    version?: string;
}

function parseArguments(message: string): Options | undefined {
    const parsed = minimist(message);

    const evalMessage = message.match(CODE_AND_LANG_ONLY);

    if (evalMessage == null) {
        return;
    }
    const result = parseCode(evalMessage[0]);
    if (result == null) {
        return;
    }

    const { code, language } = result;


    return {
        code,
        input: parsed.input,
        language: language || parsed.language,
        version: parsed.version,
        file: parsed.file,
        shell: parsed.shell,
    };
}

interface ParsedResponse {
    language: string;
    code: string;
}

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
function parseCode(_message: string): ParsedResponse | undefined {
    const message = _message.trim();
    const langMatches = message.match(LANG_POSITION);
    if (langMatches == null) {
        return;
    }
    const language = langMatches[1] || langMatches[2];

    if (message.includes('`')) {
        if (message.endsWith('```')) {
            const match = TRIPLE_BLOCK_CLEAN.exec(message);
            if (match == null) {
                return;
            }
            // removes the first 3 backticks and the language name.
            const semiClean = message.replace(match[0], '');
            return {
                language,
                // removes the last 3 backticks and trims newlines.
                code: semiClean.slice(0, semiClean.length - 3).trim(),
            };
        }

        return {
            language,
            /// removes the first backtick and the last backtick + a space
            code: message.slice(language.length + /* space */ 1 + 1, message.length - 1),
        };
    }

    return {
        language,
        code: message.split(' ').slice(1).join(' '),
    };
}

export { parseCode, parseArguments };
