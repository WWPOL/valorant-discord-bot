const { Command, DiscordUser } = require("../../command");
const { User } = require("../../data");

class WhoCommand extends Command {
    constructor(client) {
	   super(client, {
		  name: "who",
		  description: "Find the Riot ID of a Discord user.",
		  args: {
			 user: {
				type: DiscordUser.FromMsg,
				description: "Discord user of which to get Riot ID",
			 },
		  },
	   });
    }

    async command(msg, { user }) {
	   const foundUser = await User.findOne({
		  "discord.id": user.id
	   });

	   if (foundUser === null) {
		  return msg.reply(`Hmm, I don't know \
\`${user.toString()}\`'s Riot ID`);
	   }

	   return msg.reply(`\`${user.toString()}\`'s Riot ID is \
\`${foundUser.riot.name}#${foundUser.riot.tag}\``);
    }
}

module.exports = WhoCommand;
