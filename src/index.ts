import * as Bluebird from 'bluebird';

Bluebird.config({
    longStackTraces: true,
});

global.Promise = Bluebird;

// START

import Commander from 'simple-discordjs';
import * as Discord from 'discord.js';
import { discordToken } from './tokens';
import * as commands from './commands';

const client = new Discord.Client();

client.login(discordToken);

client.on('ready', async () => {
    console.log('Hello! Ready to compile!');
    console.log(await client.generateInvite());
});

const _ = new Commander('e!', client, {
    botType: 'guildonly',
})
    .defineCommand(commands.run)
    .defineCommand(commands.list)
    .generateHelp()
    .listen();
