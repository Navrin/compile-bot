import * as program from 'commander';

interface Options {
    language: string;
    shell?: string;
    file?: string;
    code: string;
}

program
    .option('-l, --language [lang]', 'Specify what language you want to use')
    .option('-s, --shell [cmd]', 'The command line command to run')
    .option('-f, --file [file]', 'The file name for the code to be evaled')
    .arguments('[code...]');

function parseArguments(message: string): Options {
    program
        .action(function (this: program.CommanderStatic, body) {
            this.body = body.join('');
        });

    const { code, language } = parseCode(program.body);

    return {
        code,
        language,
        file: program.file,
        shell: program.shell,
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

const TRIPLE_CODE_BLOCK = /```\w+[\s\S]+```/gm;
const TRIPLE_LANGUAGE_POSITIONS = /```[\w ]+$/m;

function parseJustTripleBLock(message: string): ParsedResponse {
    const langMatches = message.match(TRIPLE_LANGUAGE_POSITIONS);
    if (langMatches == null) {
        throw new SyntaxError('No language was given!');
    }

    const language = langMatches[0].slice(3);

    const uncleanCode = message.replace(TRIPLE_LANGUAGE_POSITIONS, '');
    const code = uncleanCode.slice(3, uncleanCode.length - 3).trim();

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
        return codeWithoutLang.slice(3, codeWithoutLang.length - 3);
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
        const code = rest.join(' ');

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

export { parseCode };
