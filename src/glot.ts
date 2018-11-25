import { glotToken } from "./tokens";
import fetch, { Headers } from "node-fetch";
import filenames from "./filenames";
import { Options } from "./parsing";

/**
 * Creates a snippet in glot.io and returns the URL.
 * For when the stdout is too long and would spam chat.
 * @param {string} body
 * @returns {Promise<string>}
 */
async function createSnippet(body: string): Promise<string> {
    const headers = new Headers();
    headers.set("Content-type", "application/json");

    const request = await fetch("https://snippets.glot.io/snippets", {
        headers,
        method: "POST",
        body: JSON.stringify({
            language: "plaintext",
            title: "Logs",
            public: false,
            files: [
                {
                    name: "logs",
                    content: body,
                },
            ],
        }),
    });

    const json = await request.json();
    const id = json.id;
    return `https://glot.io/snippets/${id}`;
}

const alises: Map<string[], string> = new Map();
alises.set(["asm"], "assembly");
alises.set(["cs", "coffee"], "coffeescript");
alises.set(["clj"], "clojure");
alises.set(["c#"], "csharp");
alises.set(["f#"], "fsharp");
alises.set(["hs"], "haskell");
alises.set(["js", "jscript"], "javascript");
alises.set(["py", "py3"], "python");
alises.set(["rb"], "ruby");
alises.set(["rs"], "rust");
alises.set(["sw"], "swift");
alises.set(["ts"], "typescript");
alises.set(["golang"], "go");

const languageCache: string[] = [];
/**
 * Searches up all possible language options and caches the result.
 *
 * @returns {Promise<string[]>}
 */
async function getLanguages(): Promise<string[]> {
    if (languageCache.length > 0) {
        return languageCache;
    }

    const request = await fetch("https://run.glot.io/languages");
    const json = await request.json();

    const names = json.map((entry: { name: string }) => entry.name);
    languageCache.push(...names);
    return languageCache;
}

/**
 * Searches a lang in the cache, and then the aliases
 *
 * @param {string} lang
 * @returns {Promise<string>}
 */
async function findLanguage(_lang: string): Promise<string | undefined> {
    const lang = _lang.toLowerCase();

    if (languageCache.length === 0) {
        await getLanguages();
    }

    if (languageCache.includes(lang)) {
        return lang;
    }

    for (const [set, language] of alises.entries()) {
        if (set.includes(lang)) {
            return language;
        }
    }

    return;
}

/**
 * Finds the language variants for a given language.
 *
 * @param {string} lang
 * @returns {(Promise<string[] | undefined>)}
 */
async function getVersion(lang: string): Promise<string[] | undefined> {
    const language = await findLanguage(lang);

    if (language === undefined) {
        return;
    }

    const response = await fetch(`https://run.glot.io/languages/${language}`);
    const json = await response.json();

    return json.map((e: { version: string }) => e.version);
}

interface GlotResponse {
    /**
     * stdout response from glot.io (probably what the user wants)
     *
     * @type {string}
     * @memberof GlotResponse
     */
    stdout?: string;
    /**
     * stderr result from glot.io
     *
     * @type {string}
     * @memberof GlotResponse
     */
    stderr?: string;
    /**
     * Returns (Program exited with a non zero status) if there was an error during execution.
     *
     * @type {string}
     * @memberof GlotResponse
     */
    error?: string;
    /**
     * Glot.io response on a non-successful compliation attempt (timeout etc)
     *
     * @type {string}
     * @memberof GlotResponse
     */
    message?: string;
}

interface RunResponse {
    /**
     * Signifies if the response may be too long for chat. (create a snippet instead)
     *
     * @type {boolean}
     * @memberof RunResponse
     */
    tooLong: boolean;
    body: GlotResponse;
}

/**
 * Sends a payload to glot and returns the api response in object form.
 *
 * @param {Options} payload
 * @returns {Promise<RunResponse>}
 */
async function runCode(payload: Options): Promise<RunResponse> {
    const headers = new Headers();
    headers.set("Content-type", "application/json");
    headers.set("Authorization", `Token ${glotToken}`);

    const response = await fetch(
        `https://run.glot.io/languages/${payload.language}/${payload.version ||
            "latest"}`,
        {
            headers,
            method: "POST",
            body: JSON.stringify({
                files: [
                    {
                        name: payload.file || filenames[payload.language],
                        content: payload.code,
                    },
                ],
                command: payload.shell,
                stdin: payload.input,
            }),
        },
    );

    const json: GlotResponse = await response.json();
    const tooLong: boolean =
        typeof json.stderr === "string" && typeof json.stdout === "string"
            ? json.stderr.length > 1000 || json.stdout.length > 1000
            : false;

    return {
        tooLong,
        body: json,
    };
}

export {
    getVersion,
    findLanguage,
    alises,
    createSnippet,
    getLanguages,
    runCode,
};
