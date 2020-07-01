const dot = require("dot-prop");
const { Command, MatchArg } = require("../../command");

class WhenCommand extends Command {
    constructor(client) {
	   super(client, {
		  name: "when",
		  description: "Gets the time when a match will occur.",
		  args: {
			 match: {
				type: MatchArg.FromMsg,
				description: "Match of which to get the time.",
				default: MatchArg.DefaultToOnly,
				optional: true,
			 },
		  },
	   });
    }

    async command(msg, { match }) {
	   // Check if voting is still taking place or hasn't started.
	   if (match.date === undefined ||
		  dot.get(match, "votes.time.result") === undefined) {
		  return msg.channel.send(`I don't know when the ${match.size} player match of ${match.game} will take place. Try using the \`schedule\` command to ask people when they want to play.`);
	   }

	   // Display match time if known
	   const time = new Date(match.votes.time.result);
	   const now = new Date();

	   var dateStr = `${time.getMonth()}/${time.getDate()}/${time.getYear()}`;
	   var timeStr = `${time.getHours() % 12}:${time.getMinutes()}`;
	   
	   if (time.getDate() === now.getDate() && time.getMonth() == now.getMonth() &&
		  time.getYear() === now.getYear()) {
		  dateStr = "today";
	   }

	   if (time.getHours() >= 12) {
		  timeStr += ` PM`;
	   } else {
		  timeStr += ` AM`;
	   }

	   return msg.channel.send(`The match of ${match.size} ${match.pluralize("player")} of ${match.game} will take place ${dateStr} ${timeStr}`);
    }
}

module.exports = WhenCommand;
