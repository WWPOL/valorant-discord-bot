const { Command, DiscordUser, RiotID } = require("../../command");
const { User } = require("../../db");

class RegisterCommand extends Command {
    constructor(client) {
	   super(client, {
		  name: "register",
		  description: "Associate a Discord user with a Riot account.",
		  args: {
			 discordUser: {
				name: "Discord User",
				type: DiscordUser.FromMsg,
				help: "Discord user to associate with Riot ID",
				optional: true,
				default: DiscordUser.DefaultToAuthor,
			 },
			 riotID: {
				name: "Riot ID",
				type: RiotID.FromMsg,
				help: "Riot ID of user",
			 },
		  },
	   });
    }

    async command(msg, { discordUser, riotID }) {
	   await User.findOneAndUpdate({
		  "discord.id": discordUser.id,
	   }, {
		  discord: discordUser,
		  riot: riotID,
	   }, {
		  upsert: true
	   });
	   
	   return msg.say(`Thanks, now I know \`${discordUser.toString()}\`'s Riot ID \
is \`${riotID.name}#${riotID.tag}\``);
    }
}

module.exports = RegisterCommand;
