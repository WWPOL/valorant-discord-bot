const { Command, DiscordUserArg, MatchArg } = require("../../command");
const { User } = require("../../data");

class JoinCommand extends Command {
    constructor(client) {
	   super(client, {
		  name: "join",
		  description: "Join a match.",
		  args: {
			 match: {
				type: MatchArg.FromMsg,
				description: "Match to join.",
				optional: true,
				default: MatchArg.DefaultToOnly,
			 },
			 discordUser: {
				type: DiscordUserArg.FromMsg,
				description: "Discord user to add to Match.",
				optional: true,
				default: DiscordUserArg.DefaultToAuthor,
			 },
		  }
	   });
    }

    async command(msg, { discordUser, match }) {
	   // Find discord user's mongo ID
	   const user = await User.findOne({
		  "discord.id": discordUser.id,
	   });

	   if (user === null) {
		  return msg.reply(`\`${discordUser.toString()}\` has not been \
registered so I don't know who they are. Please use the \`register\` command to \
tell me who they are.`);
	   }

	   // Check not already in the plan
	   if (match.signed_up.indexOf(user._id) !== -1) {
		  return msg.reply(`\`${discordUser.toString()}\` is already in the \
${match.size} player match for ${match.game} (Named \`${match.match_id}\`).`);
	   }
	   
	   match.signed_up.push(user._id);
	   await match.save();

	   const statusList = await match.statusList();

	   return msg.channel.send(`\`${discordUser.name}\` has joined the ${match.size} player plan for ${match.game} (Named \`${match.match_id}\`)

${statusList.join("\n")}`);
    }
}

module.exports = JoinCommand;
