/**
 * 🎫 Tokens.
 * Using env tokens instead of a config file because I don't trust git :P
 */
const _g = process.env.COMPILE_BOT_GLOT_TOKEN;
const _d = process.env.COMPILE_BOT_DISCORD_TOKEN;

if (_g == null || _d == null) {
    throw new Error("Tokens not found!");
}

const glotToken = _g;
const discordToken = _d;

export { glotToken, discordToken };
