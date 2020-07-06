const { Command, MatchArg, DateArg } = require("../../command");

class VoteCommand extends Command {
    constructor(client) {
	   super(client, {
		  name: "schedule",
		  description: "Schedule when a match will take place.",
		  args: {
			 match: {
				type: MatchArg.FromMsg,
				description: "Match to schedule.",
				optional: true,
				default: MatchArg.DefaultToOnly,
			 },
			 whenToSchedule: {
				name: "When To Schedule",
				type: DateArg.FromMsg,
				description: "When to schedule a match.",
				optional: true,
				default: DateArg.DefaultToToday,
			 },
		  },
	   });
    }

    async command(msg, { match, whenToSchedule }) {
	   // TODO: Make whenToSchedule arg also take a time, then do a y/n vote on this time and make it so the time with the most votes is the current best time, so probably remove the result field for the time vote and probably the valorant match vote. Maybe also rename this to propose and then either propose a map or a time or whatever
	   await msg.channel.send(`When would you like `);
    }
}

module.exports = VoteCommand;
