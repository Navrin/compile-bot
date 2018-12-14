/**
 * Use bluebird stack traces because they're really NICE.
 */
import * as Bluebird from "bluebird";

Bluebird.config({
    longStackTraces: true,
});

global.Promise = Bluebird;

process.on("unhandledRejection", error => {
    console.log(
        "unhandled rejection in promise: ",
        JSON.stringify(error, undefined, 4),
    );
});

// START

import Commander from "simple-discordjs";
import * as Discord from "discord.js";
import { discordToken } from "./tokens";
import * as commands from "./commands";
import { createLanguageCommands } from "./commands/run";
import { getLanguages, alises } from "./glot";

const client = new Discord.Client();

client.login(discordToken);

client.on("ready", async () => {
    const langs = await getLanguages(); // cache the languages at the start
    const langsClone = [...langs];

    // include aliases
    for (const [alias, _] of alises.entries()) {
        langsClone.push(...alias);
    }

    console.log("Hello! Ready to compile!");
    console.log(await client.generateInvite());

    const prefix = "e!";

    const commander = new Commander(prefix, client, {
        botType: "guildonly",
    })
        .defineCommand(commands.run)
        .defineCommand(commands.list)
        .defineCommand(commands.help);

    for (const command of createLanguageCommands(langsClone, prefix)) {
        commander.defineCommand(command);
    }

    commander.listen();
});
