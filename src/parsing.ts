const minimist = require('minimist-string');

const CODE_AND_LANG_ONLY = /(\w+|`{1,3}[\s\S]+`{1,3})(\s+(.+|`{1,3}[\s\S]+`{1,3}))?$/;
const LANG_POSITION = /(^[a-z]+)|```([a-z]+)$/im;
const CODE_BLOCK = /`{1,3}([\s\S]+)`{1,3}/m;
const TRIPLE_BLOCK_CLEAN = /\w*\s*```(\w*)/m;


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

            const semiClean = message.replace(match[0], '');
            return {
                language,
                code: semiClean.slice(0, semiClean.length - 3).trim(),
            };
        }

        return {
            language,
            code: message.slice(language.length + /* space */ 1 + 1, message.length - 1),
        };
    }

    return {
        language,
        code: message.split(' ').slice(1).join(' '),
    };
}

export { parseCode, parseArguments };
