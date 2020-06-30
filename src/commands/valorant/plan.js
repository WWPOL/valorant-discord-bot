const randomWords = require("random-words");

const { Command, PositiveIntegerArg } = require("../../command");
const { SUPPORTED_GAMES, Match } = require("../../data");

class PlanCommand extends Command {
    constructor(client) {
	   super(client, {
		  name: "plan",
		  description: "Start a match plan.",
		  details: `Match plans are one of the main features offered by this \
bot. A plan helps keep track of players who would be interested in playing, \
determine what time everyone can play, decide what map to play, and more!`,

		  args: {
			 game: {
				type: String,
				description: "Name of game",
			 },
			 numPlayers: {
				name: "Number Of Players",
				type: PositiveIntegerArg,
				description: "The number of players which plan will include",
			 },
		  },
	   });
    }

    async command(msg, { game, numPlayers }) {
	   // Find short ID which isn't being used as a Match ID
	   const newWord = () => randomWords({ exactly: 1, maxLength: 3 })[0];
	   var word = newWord();
		  
	   for (; await Match.findOne({ match_id: word }, { match_id: true }) !== null; word = newWord() ) {}

	   // Save match to database
	   var match = new Match();
	   match.game = Match.ParseGame(game);
	   match.game_type = Match.ParseGameType(match.game);
	   match.match_id = word;
	   match.size = numPlayers;
	   match.status = "planning";
	   
	   await match.save();

	   var supportedGameMsg = "";
	   if (match.game_type !== "other") {
		  supportedGameMsg = `\n> ${SUPPORTED_GAMES[match.game_type].customPlanMessage}`;
	   }

	   return msg.say(`**Match of ${match.size} ${this.pluralize("player", match.size)} for ${match.game} now being planned.**
> The name of this match is "\`${match.match_id}\`". If there's more than one match going on use the word "\`${match.match_id}\`" to let me know what match you're talking about.${supportedGameMsg}`);
    }
}

module.exports = PlanCommand;
