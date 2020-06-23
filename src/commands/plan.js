const { Command } = require("discord-akairo");

const redis = require("../redis");

class PlanCommand extends Command {
    constructor() {
	   super("plan", {
		  aliases: ["plan"],
		  args: [
			 {
				id: "numPlayers",
				type: "number",
			 }
		  ],
	   });
    }

    exec(message, args) {
	   // Check args
	   if ([5, 10].indexOf(args.numPlayers) === -1) {
		  return message.reply("The `<number of players>` argument must be either `5` or `10`.");
	   }

	   // Check if already planning
	   return redis.get("planning").then((res) => {
		  // If already being planned
		  if (res !== null) {
			 return message.reply(`A ${res} player game is already being planned.`);
		  }

		  // If not being planned, mark being planned for the future
		  return redis.set("planning", args.numPlayers).then(() => {
			 return message.util.send(`A ${args.numPlayers} player game is now being planned. Type \`!join\` or join or \`!join @user\` to add another user. Type \`!stop-plan\` to stop planning this game.`);
		  });
	   }).catch((err) => {
		  console.error("Error starting a plan", err);
		  return message.reply("An internal error occurred while starting a plan")
	   });
    }
}

module.exports = PlanCommand;
