const { Command } = require("discord-akairo");

const redis = require("../redis");

class CancelPlanCommand extends Command {
    constructor() {
	   super("cancel-plan", {
		  aliases: ["cancel-plan"],
	   });
    }

    exec(message, args) {
	   // Check we are planning
	   return redis.get("planning").then((res) => {
		  // If not planning
		  if (res === null) {
			 return message.reply("There is not a game being planned right now.");
		  }

		  // If being planned, unmark
		  return redis.del(["planning", "user_ids", "users_info"]).then(() => {
			 return message.reply(`The plan to play a ${res} player game has been canceled.`);
		  });
	   }).catch((err) => {
		  console.error("Error canceling a plan", err);
		  return message.reply("An internal error occurred while cancelling the plan");
	   });
    }
}

module.exports = CancelPlanCommand;
