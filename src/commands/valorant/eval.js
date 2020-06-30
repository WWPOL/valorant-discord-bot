const { Command } = require("../../command");

class EvalCommand extends Command {
    constructor(client) {
	   super(client, {
		  name: "eval",
		  description: "Evaluate a javascript command.",
	   });
    }

    async command(msg) {
	   return msg.reply(`You think I'm stupid or something?!`);
    }
}

module.exports = EvalCommand;
