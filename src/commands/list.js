const { Command } = require("discord-akairo");

const redis = require("../redis");
const utils = require("../utils");

class ListCommand extends Command {
    constructor() {
	   super("list-plan", {
		  aliases: ["list-plan"],
	   });
    }

    exec(message) {
	   // Check that a game is being planned
	   return redis.get("planning").then((planning) => {
		  if (planning === null) {
			 return message.reply("A game is not being planned right now.");
		  }

		  // Get plan members
		  return utils.list_plan(planning).then((msg) => {
			 return message.reply(`\n${msg}`);
		  });
		  
	   }).catch((err) => {
		  console.error("Error listing plan", err);
		  return message.reply("An internal error occurred while trying to display the current plan.");
	   });
    }
}

module.exports = ListCommand;
