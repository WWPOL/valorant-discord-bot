const { Command, MatchArg } = require("../../command");
const { User } = require("../../data");

class StatusCommand extends Command {
    constructor(client) {
	   super(client, {
		  name: "status",
		  description: "Gets the status of plans.",
		  args: {
			 match: {
				description: "Match of which to get status.",
				type: MatchArg.FromMsg,
				default: MatchArg.DefaultToOnly,
				optional: true,
			 }
		  }
	   });
    }

    async command(msg, { match }) {
	   const statusList = await match.statusList();
	   
	   return msg.channel.send(`**Match of ${match.size} ${match.pluralize("player")} for ${match.game}** (Named \`${match.match_id}\`)
${statusList.join("\n")}`);
    }
}

module.exports = StatusCommand;
