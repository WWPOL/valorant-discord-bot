const { Command } = require("discord.js-commando");

// TODO: Move BaseCommand class to sep. file.
class BaseCommand extends Command {
    constructor(client, spec) {
	   const argsSpec = spec.args;
	   delete spec.args;
	   
	   super(client, spec);

	   this.argsSpec = argsSpec;
    }

    run(msg) {
	   // TODO: Make arguments optional
	   var argStr = msg.argString;
	   if (argStr[0] == " ") {
		  argStr = argStr.substr(1);
	   }
	   const msgParts = argStr.length > 0 ? argStr.split(" ") : [];
	   
	   var args = {};

	   for (var i = 0; i < this.argsSpec.length; i++) {
		  const spec = this.argsSpec[i];

		  // Default name to uppercase key
		  var name = spec.name;
		  if (name === undefined) {
			 name = spec.key[0].toUpperCase() + spec.key.substr(1);
		  }

		  // Check if arg is missing
		  if (i > msgParts.length - 1) {
			 return msg.reply(`\`${name}\` argument required`);
		  }
		  
		  const raw = msgParts[i];

		  // Try converting string into arg
		  try {
			 args[spec.key] = spec.type(raw);
		  } catch (e) {
			 return msg.reply(`Error with \`${name}\` argument: ${e}`);
		  }
	   }

	   // Run command handler
	   this.command(msg, args);
    }
}

class DiscordUser {
    constructor(value) {
	   // TODO: Make DiscordUser type
	   // <@!262798724428726282>
    }
}

class RiotID {
    constructor(value) {
	   var parts = value.split("#");
	   if (parts.length != 2 ) {
		  throw "A Riot ID must be in the format: `username#tag`";
	   }

	   if (parts[0].length === 0 || parts[1].length === 0) {
		  throw "A Riot ID must be in the format: `username#tag`";
	   }

	   this.username = parts[0];
	   this.tag = parts[1];
    }
}

class RegisterCommand extends BaseCommand {
    constructor(client) {
	   super(client, {
		  name: "register",
		  group: "main",
		  memberName: "register",
		  description: "Associate a Discord user with a Riot account.",
		  args: [
			 {
				key: "discordUser",
				name: "Discord User",
				type: DiscordUser,
			 },
			 {
				key: "riotID",
				name: "Riot ID",
				type: RiotID,
			 },
		  ],
	   });
    }

    command(msg, { discordUser, riotID }) {
	   console.log(user);
	   return msg.say(`what's up bitch? discordUser=${discordUser}, riotID=${riotID}`);
    }
}

module.exports = RegisterCommand;
