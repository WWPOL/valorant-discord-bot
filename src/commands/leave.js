const { Command } = require("discord-akairo");

const redis = require("../redis");
const utils = require("../utils");

class LeaveCommand extends Command {
    constructor() {
	   super("leave", {
		  aliases: ["leave"],
		  args: [
			 {
				id: "player",
				type: "user",
			 }
		  ],
	   });
    }

    exec(message, args) {
	   // Make player arg default to sender
	   var leavingPlayer = message.author;
	   
	   if (args.player !== null) {
		  leavingPlayer = args.player;
	   }

	   // Check that a game is being planned
	   return redis.get("planning").then((planning) => {
		  if (planning === null) {
			 return message.reply("A game is not being planned right now.");
		  }

		  // Get number of users who are part of plan
		  return redis.scard("user_ids").then((membersCount) => {
			 // If being planned, check if user is already part of plan
			 return redis.sismember("user_ids", leavingPlayer.id)
				.then((ismember) => {
				    if (ismember === 0) {
					   return message.reply(`\`${leavingPlayer.username}\` is not part of the plan`);
				    }

				    return redis.srem("user_ids", leavingPlayer.id)
					   .then(() => {
						  return redis.hdel("users_info", leavingPlayer.id);
					   })
					   .then(() => {
						  return utils.list_plan(planning);
					   })
					   .then((list_msg) => {
						  const spotsLeft = (planning - membersCount) + 1;
						  var spotsLeftMsg = "";
						  
						  if (spotsLeft === 1) {
							 spotsLeftMsg = "Now 1 more player is required.";
						  } else {
							 spotsLeftMsg = `Now ${spotsLeft} more players are required.`;
						  }
							 
						  return message.reply(`\`${leavingPlayer.username}\` has left the plan to play with ${planning} players. ${spotsLeftMsg}\n\n${list_msg}`);
					   });
				});
		  });
	   }).catch((err) => {
		  console.error(`Error removing user ${leavingPlayer.username} (${leavingPlayer.id})`, err);
		  return message.reply(`An internal error occurred while trying to remove \`${leavingPlayer.username}\` to the plan.`);
	   });
    }
}

module.exports = LeaveCommand;
