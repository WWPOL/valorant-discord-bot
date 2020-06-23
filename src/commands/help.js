const { Command } = require("discord-akairo");

class HelpCommand extends Command {
    constructor() {
	   super("plan-help", {
		  aliases: ["plan-help"],
	   });
    }

    exec(message) {
	   return message.util.send(`First tell the bot to start a game plan. You must specify a game size of either
\`5\` or \`10\`:
\`\`\`
!plan <game size>
\`\`\`
Then players can join the plan:
\`\`\`
!join-plan
\`\`\`
Players can also be added by name:
\`\`\`
!join-plan @PlayerName#1234
\`\`\`
Players can also leave the plan or be removed from the plan:
\`\`\`
!leave-plan
!leave-plan @PlayerName#1234
\`\`\`
At any time the plan's status can be viewed:
\`\`\`
!list-plan
\`\`\`
The plan can also be canceled:
\`\`\`
!cancel-plan
\`\`\`
This help text can be viewed with:
\`\`\`
!plan-help
\`\`\``);
    }
}

module.exports = HelpCommand;
