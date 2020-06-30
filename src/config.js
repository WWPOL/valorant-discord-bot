const secret = require("./secret.config");

module.exports = {
    botPrefix: "v#",
    mongoURI: "mongodb://127.0.0.1/dev_valorant_discord_bot",
    ...secret,
};
