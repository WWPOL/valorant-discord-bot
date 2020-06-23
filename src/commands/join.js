const { Command } = require("discord-akairo");

const redis = require("../redis");
const utils = require("../utils");

class JoinCommand extends Command {
    constructor() {
	   super("join-plan", {
		  aliases: ["join-plan"],
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
	   var joiningPlayer = message.author;
	   
	   if (args.player !== null) {
		  joiningPlayer = args.player;
	   }

	   // Check that a game is being planned
	   return redis.get("planning").then((planning) => {
		  if (planning === null) {
			 return message.reply("A game is not being planned right now.");
		  }

		  // Check if plan is full
		  return redis.scard("user_ids").then((membersCount) => {
			 if (membersCount == planning) {
				return message.reply(`There is no room left in this plan for \`${joiningPlayer.username}\``);
			 }

			 // If being planned, check if user is already part of plan
			 return redis.sismember("user_ids", joiningPlayer.id)
				.then((ismember) => {
				    if (ismember === 1) {
					   return message.reply(`\`${joiningPlayer.username}\` is already part of the plan`);
				    }

				    return redis.sadd("user_ids", joiningPlayer.id)
					   .then(() => {
						  return redis.hset("users_info", joiningPlayer.id, joiningPlayer.username);
					   })
					   .then(() => {
						  return utils.list_plan(planning);
					   })
					   .then((list_msg) => {
						  const spotsLeft = (planning - membersCount) - 1;
						  var spotsLeftMsg = "";
						  
						  if (spotsLeft === 0) {
							 spotsLeftMsg = "No more players are required. Ready to play.";
						  } else if (spotsLeft === 1) {
							 spotsLeftMsg = "Only 1 more player required.";
						  } else {
							 spotsLeftMsg = `Only ${spotsLeft} more players required.`;
						  }
							 
						  return message.reply(`\`${joiningPlayer.username}\` has been added to the plan to play with ${planning} players. ${spotsLeftMsg}\n\n${list_msg}`);
					   });
				});
		  });
	   }).catch((err) => {
		  console.error(`Error joining user ${joiningPlayer.username} (${joiningPlayer.id})`, err);
		  return message.reply(`An internal error occurred while trying to add \`${joiningPlayer.username}\` to the plan.`);
	   });
    }
}

module.exports = JoinCommand;
