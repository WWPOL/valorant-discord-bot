const { AkairoClient, CommandHandler } = require("discord-akairo");

const config = require("./config");

class Client extends AkairoClient {
    constructor() {
	   super({
		  ownerID: config.ownerID,
	   }, {});

	   this.commandHandler = new CommandHandler(this, {
		  directory: `${__dirname}/commands`,
		  prefix: "!",
		  commandUtil: true,
	   });
	   this.commandHandler.loadAll();
    }
}

const client = new Client();
client.login(config.botToken);

console.log("Running bot")
