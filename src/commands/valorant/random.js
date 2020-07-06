const { Command } = require("../../command");

class RandomCommand extends Command {
    constructor(client) {
	   super(client, {
		  name: "random",
		  description: "Picks a random choice."
		  args: {
			 choices: {
//				type: 
				description: "Choices, seperated by spaces.",
			 },
		  },
	   });
    }
}

module.exports = RandomCommand;
