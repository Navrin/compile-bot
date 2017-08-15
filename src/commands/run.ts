import { CommandFunction, CommandDefinition } from 'simple-discordjs';
import * as Discord from 'discord.js';
import * as glot from '../glot';
import * as parsing from '../parsing';

const WARNING_EMOJI = '⚠';
const ERROR_EMOJI   = '❌';
const OUTPUT_EMOJI  = '📤';
const TADA_EMOJI    = '🎉';
const TIMER_EMOJI   = '⌛';

async function run(
    message: Discord.Message,
    _blank: any,
    _stillblank: any,
    client: Discord.Client,
): Promise<void> {
    const [_, ...contents] = message.content.split(' ');
    const code = contents.join(' ');

    message.react(TIMER_EMOJI);
    const payload = parsing.parseArguments(code);
    if (payload === undefined) {
        message.channel
        .send('Message was badly formed. Cannot parse.')
        .then((msg: Discord.Message) => msg.delete(15000));
        return;
    }

    const language = await glot.findLanguage(payload.language);

    if (language === undefined) {
        message.channel
            .send(`${payload.language} was not found as a valid language.`)
            .then((msg: Discord.Message) => msg.delete(15000));
        return;
    }

    payload.language = language;

    try {
        const embed = new Discord.RichEmbed();
        embed.setAuthor('compile-bot', client.user.avatarURL);
        const evaled = await glot.runCode(payload);
        if (evaled.body.error) {
            embed.setTitle(`${WARNING_EMOJI} Glot repoted an error!`);
            embed.setDescription(`\`\`\`proc: ${evaled.body.error}\nstderr: ${evaled.body.stderr}\`\`\``);

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
        console.log(e.stack);
        message.channel
            .send(`Error evaling the code! ${e}`)
            .then((msg: Discord.Message) => msg.delete(15000));
    }
}

const runCommand: CommandDefinition = {
    command: {
        action: run,
        parameters: '{{code}}',
        names: ['run', 'eval'],
    },
    description: {
        message: 'Runs your code in a docker instance hosted by glot.io',
        example: '{{{prefix}}}run javascript `console.log(30 + 40)`',
    },
};

export { runCommand };
