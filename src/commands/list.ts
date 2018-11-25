import { CommandFunction, CommandDefinition } from "simple-discordjs";
import * as Discord from "discord.js";
import * as glot from "../glot";
import { stripIndents } from "common-tags";
import { zip } from "lodash";

/**
 * Creates a list of possible language choices.
 *
 * @param {Discord.Message} message
 * @returns {Promise<void>}
 */
async function list(message: Discord.Message): Promise<void> {
    const langList = await glot.getLanguages();
    const firstList = langList.slice(0, Math.floor(langList.length / 2)); // first half
    const secondList = langList.slice(Math.floor(langList.length / 2)); // second half
    const largest = langList.reduce((pv, cv) =>
        pv.length > cv.length ? pv : cv,
    ).length; // largest lang for spaces

    const output = stripIndents`
        All possible languages are listed below:
        \`\`\`
            ${zip(firstList, secondList)
                .map(
                    ([l1, l2]) =>
                        `${l1}${" ".repeat(
                            largest + 2 - (l1 || "").length,
                        )}${l2}\n`,
                )
                .join("")}
        \`\`\`
    `;

    message.channel.send(output);
}

const listCommand: CommandDefinition = {
    command: {
        action: list,
        names: ["list", "langs", "alllangs"],
    },
};

export { listCommand };
