import { CommandFunction, CommandDefinition } from 'simple-discordjs';
import * as Discord from 'discord.js';
import * as glot from '../glot';
import * as parsing from '../parsing';

const WARNING_EMOJI = '⚠';
const ERROR_EMOJI   = '❌';
const OUTPUT_EMOJI  = '📤';
const TADA_EMOJI    = '🎉';
const TIMER_EMOJI   = '⌛';

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
    const [_, ...contents] = message.content.split(' ');
    const code = contents.join(' ');

    await message.react(TIMER_EMOJI);
    const payload = parsing.parseArguments(code);
    if (payload === undefined) {
        message.react(ERROR_EMOJI);
        message.channel
            .send('Message was badly formed. Cannot parse.');
        return;
    }

    const language = await glot.findLanguage(payload.language);

    if (language === undefined) {
        const langTrimmed =
            `${payload.language.slice(0, 20)}${(payload.language.length > 20) ? '...' : ''}`;
        message.react(ERROR_EMOJI);
        message.channel
            .send(`${payload.language} was not found as a valid language.`);
        return;
    }

    payload.language = language;

    try {
        const embed = new Discord.RichEmbed();
        embed.setAuthor('', client.user.avatarURL);

        const evaled = await glot.runCode(payload);
        if (evaled.body.error) {
            embed.setTitle(`${WARNING_EMOJI} Glot repoted an error!`);
            embed.setDescription(`\`\`\`proc: ${evaled.body.error}\nstderr: ${evaled.body.stderr}\nstdout: ${evaled.body.stdout}\`\`\``);

            message.channel.send({ embed });
            return;
        }

        if (evaled.tooLong) {
            const snippet = await glot.createSnippet(
                `stdout: ${evaled.body.stdout}\nstderr: ${evaled.body.stderr}`,
            );

            embed.setTitle('Output too long!');
            embed.setDescription('Output was above 1000 characters, so the contents has been sent to a glot snippet instead');
            embed.addField('Snippet', snippet);

            message.channel.send({ embed });
            return;
        }

        const result =
             '```' + `${OUTPUT_EMOJI} stdout: \n` + (evaled.body.stdout || 'null') + '```' +
             '```' + `${ERROR_EMOJI} stderr: \n` + (evaled.body.stderr || 'null') + '```';


        message.channel.send(result);
        return;
    } catch (e) {
        message.channel
            .send(`Error evaling the code! \`\`\` ${e}\`\`\``)
            .then((msg: Discord.Message) => msg.delete(15000));
    }
}

const runCommand: CommandDefinition = {
    command: {
        action: run,
        parameters: '{{code}}',
        names: ['run', 'eval'],
    },
};

export { runCommand };
