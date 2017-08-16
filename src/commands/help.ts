import { CommandDefinition } from 'simple-discordjs';
import * as Discord from 'discord.js';

const helpMessage = `
To run code, use either

===
e!run lang code
e!run lang \\\`code\\\`
e!run lang \\\`\\\`\\\`lang
code
\\\`\\\`\\\`
e!run \\\`\\\`\\\`lang
code
\\\`\\\`\\\`
\`\`\`
Run options include
--shell "shell command to run"
--file "file name for code to be evaled"
--input "input to be added into stdin"
--version "version of lang to use (default is 'latest')
\`\`\`
===

To view all languages
e!list
`;

async function help(message: Discord.Message) {
    message.channel.send('Help has been sent to your PMs!')
        .then((msg: Discord.Message) => msg.delete(4000));

    message.author.send(helpMessage)
        .catch(e => message.channel.send('Your PMs are disabled! (sorry!)'));
}

const helpCommand: CommandDefinition = {
    command: {
        action: help,
        names: ['help', 'h'],
    },
};

export { helpCommand };
