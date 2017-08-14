import * as Bluebird from 'bluebird';

Bluebird.config({
    longStackTraces: true,
});

global.Promise = Bluebird;

import Commander from 'simple-discordjs';
import * as Discord from 'discord.js';

const client = new Discord.Client();

const glotToken = process.env.COMPILE_BOT_GLOT_TOKEN;
const discordToken = process.env.COMPILE_BOT_DISCORD_TOKEN;

if (glotToken == null || discordToken == null) {
    throw new Error('Tokens not found!');
}

client.login(discordToken);

const commander = new Commander('e!', client, {
    botType: 'guildonly',
});
