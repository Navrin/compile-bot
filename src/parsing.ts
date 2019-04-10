import parser, { ParseResult, CODE_LANG } from "./parser";
import * as P from "parsimmon";
import { loggit } from ".";

const minimist = require("minimist-string");

/**
 * Spooky regex.
 * Be scared! 👻
 */
const CODE_AND_LANG_ONLY = /(\w+|`{1,3}[\s\S]+`{1,3})(\s+(.+|`{1,3}[\s\S]+`{1,3}))?$/gm;
const LANG_POSITION = /(^[a-z]+)|```([a-z]+)$/gim;
const CODE_BLOCK = /`{1,3}([\s\S]+)`{1,3}/gm;
const TRIPLE_BLOCK_CLEAN = /\w*\s*```(\w*)/gm;

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
    shell?: string;
    /**
     * Filename, default is main.langextention
     *
     * @type {string}
     * @memberof Options
     */
    file?: string;
    /**
     * The actual code to be sent to glot.io and executed
     *
     * @type {string}
     * @memberof Options
     */
    code: string;
    /**
     * Optional stdin argument, to mock fake input events
     *
     * @type {string}
     * @memberof Options
     */
    input?: string;
    /**
     * Specify what version of a language the user wants to run their code in.
     * By default, use the latest version.
     *
     * @type {string}
     * @memberof Options
     */
    version?: string;
    /**
     * Setting to run the code in the implicit evaluation contexts
     * defined
     */
    eval?: string | boolean;
}

function disambiguateParseType(message: string): ParseResult {
    if (!message.includes("`")) {
        return parser.SingleFlagless.parse(message);
    }

    return message.trim().endsWith("```")
        ? parser.Triple.parse(message.trim())
        : parser.Single.parse(message.trim());
}

function parseArguments(message: string): Options | P.Failure {
    const parsed: ParseResult = disambiguateParseType(message);

    if (!parsed.status) {
        return parsed;
    }

    const search = CODE_LANG.exec(message);
    const lang = search ? search[1] : parsed.value.language;

    const rawFlags = parsed.value.flags ? parsed.value.flags.trim() : "";

    const flags = minimist(rawFlags);

    const payload = {
        code: parsed.value.code,
        input: flags.input,
        language: lang || flags.language,
        version: flags.version,
        file: flags.file,
        shell: flags.shell,
        eval: flags.eval,
    };

    loggit(payload);

    return payload;
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

    if (message.includes("`")) {
        if (message.endsWith("```")) {
            const match = TRIPLE_BLOCK_CLEAN.exec(message);
            if (match == null) {
                return;
            }
            // removes the first 3 backticks and the language name.
            const semiClean = message.replace(match[0], "");
            return {
                language,
                // removes the last 3 backticks and trims newlines.
                code: semiClean.slice(0, semiClean.length - 3).trim(),
            };
        }

        return {
            language,
            /// removes the first backtick and the last backtick + a space
            code: message.slice(
                language.length + /* space */ 1 + 1,
                message.length - 1,
            ),
        };
    }

    return {
        language,
        code: message
            .split(" ")
            .slice(1)
            .join(" "),
    };
}

export { parseCode, parseArguments };
