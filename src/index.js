const { CommandoClient } = require("discord.js-commando");
const mongoose = require("mongoose");

const path = require("path");

const config = require("./config");


const client = new CommandoClient({
    commandPrefix: "v#",
    owner: config.ownerIDs,
});

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
}).catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
}).then(() => {
    console.log("MongoDB connected");
    
    client.registry
	   .registerGroups([
		  ["valorant", "VALORANT commands"],
	   ])
	   .registerDefaultTypes()
	   .registerDefaultGroups()
	   .registerDefaultCommands({
		  prefix: false,
		  eval: false,
		  commandState: false,
	   })
	   .registerCommandsIn(path.join(__dirname, "commands"));

    client.login(config.botToken);

    console.log("Discord bot authenticated");

    return new Promise((resolve, reject) => {
	   client.once("ready", resolve);
	   client.on("error", (err) => {
		  console.error("Discord bot error:", err);
	   });
    });
}).then(() => {
    client.user.setActivity("VALLYORANT");
    
    console.log("Discord bot ready");
}).catch((err) => {
    console.error("Error setting up Discord bot client:", err);
    process.exit(1);
});
