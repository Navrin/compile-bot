const minimist = require('minimist-string');

const CODE_AND_LANG_ONLY = /(\w+|`{1,3}[\s\S]+`{1,3})(\s+(.+|`{1,3}[\s\S]+`{1,3}))?$/;
const TRIPLE_CODE_BLOCK = /```\w+[\s\S]+```/gm;
const TRIPLE_LANGUAGE_POSITIONS = /```(\w+ ?)/m;

export interface Options {
    language: string;
    shell?:   string;
    file?:    string;
    code:     string;
    input?:   string;
    version?: string;
}

function parseArguments(message: string): Options | undefined {
    const parsed = minimist(message, {
        alias: {
            f: 'file',
            s: 'shell',
            l: 'language',
            v: 'version',
            i: 'input',
        },
    });

    const evalMessage = message.match(CODE_AND_LANG_ONLY);

    if (evalMessage == null) {
        return;
    }
    const { code, language } = parseCode(evalMessage[0]);


    return {
        code,
        input: parsed.input,
        language: language || parsed.language,
        version: parsed.version,
        file: parsed.file,
        shell: parsed.shell,
    };
}

/**
 * Resprents a response, seperated by language and code contents.
 *
 * @interface ParseResponse
 */
interface ParsedResponse {
    language: string;
    code: string;
}


function parseJustTripleBLock(message: string): ParsedResponse {
    const langMatches = message.match(TRIPLE_LANGUAGE_POSITIONS);
    if (langMatches == null) {
        throw new SyntaxError('No language was given!');
    }

    const language = langMatches[0].slice(3);

    const uncleanCode = message.replace(TRIPLE_LANGUAGE_POSITIONS, '');
    const code = uncleanCode.slice(0, uncleanCode.length - 3).trim();

    return {
        code,
        language,
    };
}

/**
 * Transforms a code block like ```lang code``` or `code` to code
 * @param code
 */
function parseCodeBlock(code: string): string {
    const isTriple = code.startsWith('```');
    if (isTriple) {
        const codeWithoutLang = code.replace(TRIPLE_LANGUAGE_POSITIONS, '');
        return codeWithoutLang.slice(0, codeWithoutLang.length - 3);
    }

    return code.slice(1, code.length - 1);
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
function parseCode(message: string): ParsedResponse {
    const sep = message.trim().split(' ');
    if (sep[0].startsWith('```')) {
        // command is e!run ```lang ```
        return parseJustTripleBLock(message);
    } else {
        const [language, ...rest] = sep;
        const code = rest.join(' ').trim();

        if (code.startsWith('`')) {
            const cleaned = parseCodeBlock(code);
            return {
                language,
                code: cleaned.trim(),
            };
        }

        return {
            language,
            code: code.trim(),
        };
    }
}

export { parseCode, parseArguments };
