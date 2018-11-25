import { CommandFunction, CommandDefinition } from "simple-discordjs";
import * as Discord from "discord.js";
import * as glot from "../glot";
import * as parsing from "../parsing";
import * as P from "parsimmon";
import { implictsForLang } from "../implicts";

const WARNING_EMOJI = "⚠";
const ERROR_EMOJI = "❌";
const OUTPUT_EMOJI = "📤";
const TADA_EMOJI = "🎉";
const TIMER_EMOJI = "⌛";

/**
 * Transforms a user code input into a parsed interface,
 * then sends the code and options to glot.io's api,
 * and returns whatever output is contained within stdout.
 *
 * @param {Discord.Message} message
 * @param {*} _blank - unneeded param
 * @param {*} _stillblank - unneeded
 * @param {Discord.Client} client
 * @returns {Promise<void>}
 */
async function run(
    message: Discord.Message,
    _blank: any,
    _stillblank: any,
    client: Discord.Client,
): Promise<void> {
    // removes the e!run part
    const [_, ...contents] = message.content.split(" ");
    const code = contents.join(" ");

    await message.react(TIMER_EMOJI);
    const payload = parsing.parseArguments(code);

    if ("status" in payload) {
        failureMessage(message, payload);
        return;
    }

    return await runCode(payload, message, Boolean(payload.eval) || false);
}

function failureMessage(message: Discord.Message, payload: P.Failure) {
    message.react(ERROR_EMOJI);
    message.channel.send(
        `Error parsing message: Expected {${payload.expected.join(
            ", ",
        )}} \nLocation ->  Line: ${payload.index.line}, Column: ${
            payload.index.column
        }, Offset: ${payload.index.offset}`,
    );
}

async function runCode(
    payload: parsing.Options,
    message: Discord.Message,
    implictMode = false,
): Promise<void> {
    const language = await glot.findLanguage(payload.language);

    if (language === undefined) {
        const langTrimmed = `${payload.language.slice(0, 20)}${
            payload.language.length > 20 ? "..." : ""
        }`;
        message.react(ERROR_EMOJI);
        message.channel.send(
            `${payload.language} was not found as a valid language.`,
        );
        return;
    }

    payload.language = language;

    const ctx = implictsForLang[language];

    if (
        typeof payload.eval === "string"
            ? payload.eval === "true"
            : payload.eval
    ) {
        if (ctx == null) {
            message.channel.send(
                `${payload.language} does not have a implicit eval context!`,
            );

            return;
        }
        payload.code = ctx(payload.code);
    }

    try {
        const evaled = await glot.runCode(payload);

        if (evaled.body.message) {
            message.channel.send(
                `${WARNING_EMOJI} Glot reported an error: ${
                    evaled.body.message
                }.`,
            );
        }

        if (evaled.body.stderr == null || evaled.body.stdout == null) {
            message.channel.send(
                `Code timed out! (we haven't solved the halting problem, sorry)`,
            );
            return;
        }

        if (evaled.body.error) {
            const output =
                `${WARNING_EMOJI} Glot repoted an error!\n` +
                `\`\`\`proc: ${evaled.body.error}\nstderr: ${
                    evaled.body.stderr
                }\nstdout: ${evaled.body.stdout}\`\`\``;

            message.channel.send(output);
            return;
        }

        if (evaled.tooLong) {
            const snippet = await glot.createSnippet(
                `stdout: ${evaled.body.stdout}\nstderr: ${evaled.body.stderr}`,
            );

            const output =
                "Output too long!\n" +
                "Output was longer than 1000 characters, so the contents has been sent to a glot snippet instead\n" +
                `link: ${snippet}`;

            message.channel.send(output);
            return;
        }

        const noStderr = evaled.body.stderr.length <= 0;
        const noStdout = evaled.body.stdout.length <= 0;
        const stdEmpty = noStderr && noStdout;

        const implictMessage = implictMode
            ? "\nThis was the result of the code executed in implict mode (tried input as expression)"
            : "";

        const stdResult =
            "```" +
            `${OUTPUT_EMOJI} stdout: \n` +
            (evaled.body.stdout || "null") +
            "```" +
            "```" +
            `${ERROR_EMOJI} stderr: \n` +
            (evaled.body.stderr || "null") +
            "```";

        const retryMessage = ctx
            ? `${TIMER_EMOJI}Retrying in implicit evaluation mode.`
            : "";

        const result = implictMessage + (stdEmpty ? retryMessage : stdResult);

        message.channel.send(result);

        if (
            stdEmpty &&
            ctx != null &&
            payload.code.length > 0 &&
            !implictMode
        ) {
            // trying in implict eval mode.

            const newInput = ctx(payload.code);

            payload.code = newInput;
            return runCode(payload, message, true);
        }

        return;
    } catch (e) {
        message.channel
            .send(`Error evaling the code! \`\`\` ${e}\`\`\``)
            .then((msg: Discord.Message | Discord.Message[]) => {
                const messages = Array.isArray(msg) ? msg : [msg];

                messages.forEach(msg => msg.delete(15000));
            });
    }
}

const runCommand: CommandDefinition = {
    command: {
        action: run,
        parameters: "{{code}}",
        names: ["run", "eval"],
    },
};

/**
 * // TODO: make this more elegant
 * Pretty hacky, but allows for e!lang to be used instead of e!run language
 * @param list
 * @param prefix
 */
function createLanguageCommands(list: string[], prefix: string) {
    return list.map(lang => ({
        command: {
            async action(message: Discord.Message): Promise<void> {
                const contents = message.content.split(" ");
                const first = contents[0];
                const language = first.slice(prefix.length);

                await message.react(TIMER_EMOJI);
                const payload = parsing.parseArguments(
                    `${language} ${contents.slice(1).join(" ")}`,
                );

                if ("status" in payload) {
                    failureMessage(message, payload);
                    return;
                }

                return await runCode(payload, message);
            },
            names: [lang],
        },
    }));
}

export { runCommand, runCode, createLanguageCommands };
