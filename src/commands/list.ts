import { CommandFunction, CommandDefinition } from 'simple-discordjs';
import * as Discord from 'discord.js';
import * as glot from '../glot';
import { stripIndents } from 'common-tags';
import * as _ from 'lodash';

async function list(
    message: Discord.Message,
    _blank: any,
    _stillblank: any,
    client: Discord.Client,
): Promise<void> {
    const langList = await glot.getLanguages();
    const firstList = langList.slice(0, Math.floor(langList.length / 2));
    const secondList = langList.slice(Math.floor(langList.length / 2));
    const output = stripIndents`
        All possible languages are listed below:
        \`\`\`
            ${
                _.zip(firstList, secondList)
                    .map(([l1, l2]) => `${l1}${' '.repeat(15 - l1.length)}${l2}\n`).join('')
             }
        \`\`\`
    `;

    message.channel.send(output);
}

const listCommand: CommandDefinition = {
    command: {
        action: list,
        names: ['list', 'langs', 'alllangs'],
    },
    description: {
        message: 'Lists all possible languages the glot.io api can use.',
        example: '{{{prefix}}}list',
    },
};

export { listCommand };
