const { Command, DiscordUser, RiotID } = require("../../command");

class RegisterCommand extends Command {
    constructor(client) {
	   super(client, {
		  name: "register",
		  description: "Associate a Discord user with a Riot account.",
		  args: {
			 discordUser: {
				name: "Discord User",
				type: DiscordUser.FromMsg,
				optional: true,
				default: DiscordUser.DefaultToAuthor,
			 },
			 riotID: {
				name: "Riot ID",
				type: RiotID.FromMsg,
			 },
		  },
	   });
    }

    async command(msg, { discordUser, riotID }) {
	   console.log(discordUser, riotID);
	   return msg.say(`what's up bitch? discordUser=${discordUser}, riotID=${riotID}`);
    }
}

module.exports = RegisterCommand;
