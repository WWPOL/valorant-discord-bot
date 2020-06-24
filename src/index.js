const { CommandoClient } = require("discord.js-commando");
const mongoose = require("mongoose");

const path = require("path");

const config = require("./config");


const client = new CommandoClient({
    commandPrefix: "v#",
    owner: config.ownerIDs,
});
mongoose.connect(`mongodb://127.0.0.1/valorant_discord_bot`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
}).then(() => {
    console.log("MongoDB connected");
    
    client.registry
	   .registerDefaultTypes()
	   .registerGroups([
		  ["main", "Main commands"],
	   ])
	   .registerDefaultGroups()
	   .registerDefaultCommands()
	   .registerCommandsIn(path.join(__dirname, "commands"));

    client.login(config.botToken);

    console.log("Discord bot authenticated");

    return new Promise((resolve, reject) => {
	   client.once("ready", resolve);
	   client.on("error", (err) => {
		  console.error("Discord bot error", err);
	   });
    });
}).then(() => {
    client.user.setActivity("VALLYORANT");
    
    console.log("Discord bot ready");
}).catch((err) => {
    console.error("Error setting up Discord bot client", err);
});
