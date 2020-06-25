const randomWords = require("random-words");

const { Command, Integer } = require("../../command");
const { Match } = require("../../db");

class PlanCommand extends Command {
    constructor(client) {
	   super(client, {
		  name: "plan",
		  description: "Start a match plan.",
		  details: `Match plans are one of the main features offered by this \
bot. A plan helps keep track of players who would be interested in playing, \
determine what time everyone can play, decide what map to play, and more!`,

		  args: {
			 numPlayers: {
				name: "Number Of Players",
				type: Integer,
				description: "The number of players which plan will include",
			 },
		  },
	   });
    }

    async command(msg, { numPlayers }) {
	   // Find short ID which isn't being used as a Match ID
	   const newWord = () => randomWords({ exactly: 1, maxLength: 3 })[0];
	   var word = newWord();
		  
	   for (; await Match.findOne({ match_id: word }, { match_id: true }) !== null; word = newWord() ) {}

	   var plan = new Plan();
	   plan.match_id = word;
	   // TODO: Add author to plan and save
    }
}

module.exports = PlanCommand;
