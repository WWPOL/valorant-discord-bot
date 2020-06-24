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

    return new Promise((resolve, reject) => {
	   client.once("ready", resolve);
	   client.on("error", (err) => {
		  console.error("Discord bot error", err);
	   });
    });
}).then(() => {
    console.log("Discord bot ready");
    
    client.login(config.botToken);
    client.user.setActivity("Watchu want?");

    console.log("Discord bot logged in");
}).catch((err) => {
    console.error("Error setting up Discord bot client", err);
});
