const _g = process.env.COMPILE_BOT_GLOT_TOKEN;
const _d = process.env.COMPILE_BOT_DISCORD_TOKEN;

if (_g == null || _d == null) {
    throw new Error('Tokens not found!');
}

const glotToken = _g;
const discordToken = _d;

export {
    glotToken,
    discordToken,
};
