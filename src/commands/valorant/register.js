const { Command, DiscordUserArg, RiotIDArg } = require("../../command");
const { User } = require("../../data");

class RegisterCommand extends Command {
    constructor(client) {
	   super(client, {
		  name: "register",
		  description: "Associate a Discord user with a Riot account.",
		  args: {
			 discordUser: {
				name: "Discord User",
				type: DiscordUserArg.FromMsg,
				description: "Discord user to associate with Riot ID.",
				optional: true,
				default: DiscordUserArg.DefaultToAuthor,
			 },
			 riotID: {
				name: "Riot ID",
				type: RiotIDArg.FromMsg,
				description: "Riot ID of user.",
			 },
		  },
	   });
    }

    async command(msg, { discordUser, riotID }) {
	   var queryRes = await User.findOneAndUpdate({
		  "discord.id": discordUser.id,
	   }, {
		  discord: discordUser,
		  riot: riotID,
	   }, {
		  upsert: true
	   });

	   if (queryRes === null || queryRes.riot.name !== riotID.name
		  || queryRes.riot.tag !== riotID.tag) {
		  return msg.say(`Thanks, now I know \`${discordUser.toString()}\`'s \
Riot ID is \`${riotID.toString()}\``);
	   } else {
		  return msg.say(`Geeze you think you're so smart huh? :rolling_eyes: \
I already knew \`${discordUser.toString()}\`'s Riot ID \
was \`${riotID.toString()}\`.`);
	   }
    }
}

module.exports = RegisterCommand;
