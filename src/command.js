const { Command } = require("discord.js-commando");
const { SUPPORTED_GAMES, Match } = require("./data");

/**
 * Custom base class which all other bot commnads should extend. Provides enhanced
 * functionality ontop of the existing base Command class:
 *
 * - Better argument parsing
 * - Asynchronous command handler method
 * - Removal of duplicate commands specification fields
 *
 * To start simply define a command as usual and override the command(msg, args)
 * method. Take note of the fact that the `args` field in the command specification
 * is different, see Better argument parsing for more.
 *
 * Better argument parsing:
 * The command specification can contain an `args` field which should be an object.
 * Object keys are the name of the key under which the argument value will be 
 * stored and passed to the command() method via the args argument. Values are 
 * argument specification objects. These objects can have the following keys:
 *
 * - name (String, Optional): User friendly name of argument. If not provided this
 *       defaults to the `key` field with its first letter capitalized.
 * - type (Function): Asynchronous function which is called with the string value
 *       of the argument and the Discord Message as arguments, it is expected to
 *       return the argument converted into the type.
 * - description (String): Help describing argument.
 * - optional (Boolean, Optional): If true the argument won't be required.
 * - default (Function, Optional): Asynchronous function which is called with the 
 *       Discord Message object as an argument. It should return a default value.
 *       Can only be provided if `optional` is true.
 *
 * For example:
 * ```
 * {
 *     args: {
 *         foobar: {
 *             name: "Foo Bar",
 *             type: Number,
 *             description: "A number which is an argument for the baz",
 *             optional: true,
 *             default: () => 30,
 *         },
 *     },
 * }
 * ```
 * Defines an optional number argument which defaults to `30` and who's value will 
 * be stored under the `foobar` key.
 *
 * Aynschronous command handler method:
 * When the command is sent by the user the command() method will be called with the
 * Discord Message and a map of arguments. This method is marked as asynchronous so
 * await syntax can be used.
 * 
 * Removal of duplicate commands specification fields:
 * The .memberName and .group specification fields are not required.
 */
class BaseCommand extends Command {
    constructor(client, spec) {
	   // Capture our custom args spec
	   var argsSpec = spec.args;
	   delete spec.args;

	   if (argsSpec === undefined) {
		  argsSpec = {};
	   }

	   // Validate argument specifications
	   var argSpecErrors = [];
	   Object.keys(argsSpec).map((key) => {
		  const argSpec = argsSpec[key];
		  
		  var errs = [];

		  // Check for missing required keys
		  if (argSpec.type === undefined) {
			 errs.push(`missing "type" key`);
		  }

		  if (argSpec.description === undefined) {
			 errs.push(`missing "description" key`);
		  }

		  // Check for keys which can only exist conditionally
		  if ((argSpec.optional === undefined | argSpec.optional === false)
			 && argSpec.default !== undefined) {
			 errs.push(`cannot have "default" key if "optional" is set to false`);
		  }

		  // Check for keys of incorrect types
		  [["name", "string"],
		   ["type", "function"],
		   ["description", "string"],
		   ["optional", "boolean"],
		   ["default", "function"]].map((typeSpec) => {
			  if (argSpec[typeSpec[0]] !== undefined
				 && typeof(argSpec[typeSpec[0]]) !== typeSpec[1]) {
				 errs.push(`"${typeSpec[0]}" field must be a "${typeSpec[1]}" \
not a "${typeof(argSpec[typeSpec[0]])}"`);
			  }
		   });
		   

		  if (errs.length > 0) {
			 argSpecErrors.push([key, errs]);
		  }
	   });

	   if (argSpecErrors.length > 0) {
		  var errStrs = argSpecErrors.map((e) => {
			 return `error with "${e[0]}" argument specification: ${e[1].join(", ")}`;
		  });
		  throw `Error registering the "${spec.name}" command: ${errStrs.join(",")}`;
	   }

	   // Default name to uppercase key
	   Object.keys(argsSpec).map((key) => {
		  const spec = argsSpec[key];

		  if (spec.name === undefined) {
			 argsSpec[key].name = key[0].toUpperCase() + key.substr(1);
		  }
	   });

	   // Allow user to omit memberName and group fields
	   if (spec.memberName === undefined) {
		  spec.memberName = spec.name;
	   }

	   if (spec.group === undefined) {
		  spec.group = "valorant";
	   }

	   // Set custom format argument based on argsSpec
	   spec.format = Object.keys(argsSpec).map((key) => {
		  const argSpec = argsSpec[key];

		  var pre = "";
		  var post = "";
		  if (argSpec.optional === true) {
			 pre = "[";
			 post = "]";
		  }

		  return `${pre}<${argSpec.name}>${post}`
	   }).join(" ");

	   if (Object.keys(argsSpec).length > 0) {
		  if (spec.details === undefined) {
			 spec.details = `*N/A*\n**Arguments:**\n`;
		  } else {
			 spec.details += "\n**Arguments:**\n";
		  }
		  
		  spec.details += Object.keys(argsSpec).map((key) => {
			 const argSpec = argsSpec[key];

			 var pre = "";
			 var post = "";
			 var neededMsg = "(Required)";
			 if (argSpec.optional === true) {
				pre = "[";
				post = "]";
				neededMsg = "(Optional)";
			 }	 

			 return `- \`${pre}<${argSpec.name}>${post}\` ${neededMsg}: ${argSpec.description}`;
		  }).join("\n");
	   }
	   
	   super(client, spec);

	   this.spec = spec;
	   this.argsSpec = argsSpec;
    }

    /**
	* Adds an "s" onto value if number is > 1.
	*/
    pluralize(value, number) {
	   if (number > 1) {
		  return `${value}s`;
	   }

	   return value;
    }

    run(msg) {
	   var msgParts = msg.argString.split(" ").filter((v) => v.length > 0);
	   
	   var args = {};

	   var runHandler = true;
	   const argsKeys = Object.keys(this.argsSpec);

	   var self = this;
	   var argsProm = async function() {
		  for (var i = 0; i < argsKeys.length; i++) {
			 const key = argsKeys[i];
			 const spec = self.argsSpec[key];

			 await async function() {
				// Check if arg is missing
				if (argsKeys.length > msgParts.length) {
				    if (spec.optional === true) {
					   // Set to default value if default provided
					   if (spec.default !== undefined) {
						  args[key] = await Promise.resolve(
							 spec.default(msg));
					   }
					   
					   // Put a dummy item in the msgParts array so that
					   // future args which aren't optional will still be at
					   // the correct index.
					   msgParts.splice(i, 0, `<optional argument \
${spec.name} not provided>`);
					   
					   return Promise.resolve();
				    } else {
					   runHandler = false;
					   return msg.reply(`\`${spec.name}\` argument required`);
				    }
				}
				
				const raw = msgParts[i];

				// Try converting string into arg
				args[key] = await Promise.resolve(spec.type(raw, msg));
			 }().catch((e) => {
				runHandler = false;
				var argValue = "empty";
				if (msgParts[i] !== undefined) {
				    argValue = `\`${msgParts[i]}\``;
				}
				
				return msg.reply(`Error with \`${spec.name}\` argument, \
was ${argValue}: ${e}`);
			 });

		  }
		  return Promise.resolve();
	   }();

							
	   // Then run the command handler
	   return argsProm.then(() => {
		  if (runHandler === true) {
			 try {
				return Promise.resolve(this.command(msg, args));
			 } catch (e) {
				return Promise.reject(e);
			 }
		  }
	   })
		  .catch((e) => {
			 console.error(e);
			 return msg.reply(`Oops, it looks like something went wrong. Don't worry my owner has already been informed.`);
		  });
    }

    command(msg, args) {
	   throw `"${this.spec.name}" command has not implemented the command() method`;
    }
}

/**
 * Argument which references a Discord user.
 */
class DiscordUserArg {
    constructor(id, name, discriminator) {
	   this.id = id;
	   this.name = name;
	   this.discriminator = discriminator;
    }

    toString() {
	   return `${this.name}#${this.discriminator}`;
    }
    
    static async FromMsg(value, msg) {
	   // Get user ID
	   const matches = value.match(/<@!([0-9]{18})>/);
	   if (matches === null) {
		  throw "Must be a Discord user mention";
	   }
	   
	   const userID = matches[1];

	   // Get user name
	   return msg.client.users.fetch(userID)
		  .then((user) => {
			 const userName = user.username;

			 return Promise.resolve(new DiscordUserArg(userID, user.username,
											   user.discriminator));
		  })
		  .catch((e) => {
			 console.error(`Failed to find user "${userID}"`, e);
			 return Promise.reject("Failed to find user mentioned");
		  });
    }

    static DefaultToAuthor(msg) {
	   return new DiscordUserArg(msg.author.id, msg.author.username,
						    msg.author.discriminator);
    }
}

/**
 * Riot ID argument type.
 */
class RiotIDArg {
    constructor(name, tag) {
	   this.name = name;
	   this.tag = tag;
    }

    static FromMsg(value, msg) {
	   var parts = value.split("#");
	   if (parts.length != 2 ) {
		  throw "A Riot ID must be in the format: `username#tag`";
	   }

	   if (parts[0].length === 0 || parts[1].length === 0) {
		  throw "A Riot ID must be in the format: `username#tag`";
	   }

	   return new RiotIDArg(parts[0], parts[1]);
    }

    toString() {
	   return `${this.name}#${this.tag}`;
    }
}

/**
 * Integer argument type.
 */
function IntegerArg(value, msg) {
    value = value.replace(",", "");
    if (value.indexOf(".") !== -1) {
	   throw "Must be an integer value"
    }

    if (/[0-9]+/.test(value) === false) {
	   throw "Must be an integer value";
    }

    return parseInt(value);
}

/**
 * Match.
 */
const MatchArg = {
    FromMsg: async (id) => {
	   return Match.findOne({ match_id: id });
    },
    DefaultToOnly: async (msg) => {
	   var matches = await Match.find({
		  status: "planning",
	   });

	   if (matches.length === 0) {
		  throw `I don't know what match you're talking about since there are \
none going on right now. Please use a specific match ID.`;
	   } else if (matches.length > 1) {
		  var matchesList = matches.map((match) => {
			 return `\`${match.match_id}\` - ${match.size} ${match.pluralize("player")}, ${match.game}`;
		  }).join("\n• ");
		  
		  throw `There are multiple matches going on right now. Please use \
the match ID to tell me know which one:

• ${matchesList}`;
	   } else {
		  return matches[0];
	   }
    },
};

module.exports = {
    Command: BaseCommand,
    DiscordUserArg,
    RiotIDArg,
    IntegerArg,
    MatchArg,
};
