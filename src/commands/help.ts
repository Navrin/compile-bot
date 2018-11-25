import { CommandDefinition } from "simple-discordjs";
import * as Discord from "discord.js";

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
    // Maybe put channel send into a try catch block too?
    const msg = <Discord.Message>(
        await message.channel.send("Help has been sent to your PMs!")
    );
    msg.delete(4000);

    try {
        message.author.send(helpMessage);
    } catch (e) {
        await message.channel.send("Your PMs are disabled (sorry!)");
    }
}

const helpCommand: CommandDefinition = {
    command: {
        action: help,
        names: ["help", "h"],
    },
};

export { helpCommand };
