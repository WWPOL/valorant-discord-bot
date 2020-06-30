const { Command, MatchArg } = require("../../command");
const { SUPPORTED_GAMES, Match } = require("../../data");

const randomWords = require("random-words");

class CancelCommand extends Command {
    constructor(client) {
	   super(client, {
		  name: "cancel",
		  description: "Cancel a match plan.",
		  args: {
			 match: {
				type: MatchArg.FromMsg,
				description: "Name of the match.",
				optional: true,
				default: MatchArg.DefaultToOnly,
			 },
		  },
	   });
    }

    async command(msg, { match }) {

	   // Save match to database
	   match.status = "canceled";
	   await match.save();

	   return msg.say(`**The match of ${match.size} ${this.pluralize("player", match.size)} for ${match.game} is now canceled.** (Named \`${match.match_id}\`)`);
    }
}

module.exports = CancelCommand;
