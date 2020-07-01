const { Command } = require("discord.js-commando");
const { SUPPORTED_GAMES, Match } = require("./data");

/**
 * Characters which are considered valid punctuation when ending a sentence.
 */
const VALID_PUNCTUATION = [ ".", "?", "!" ];
const VALID_PUNCTUATION_LIST_STR = `"${VALID_PUNCTUATION.join("\" \"")}"`;

/**
 * Custom base class which all other bot commands should extend. Provides enhanced
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
 *             default: (msg) => 30,
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
	   
	   // Validate command specification
	   var cmdSpecErrors = [];

	   // Check for missing required keys
	   ["name", "description"].map((key) => {
		  if (spec[key] === undefined) {
			 cmdSpecErrors.push(`missing "${key}" key`);
		  }
	   });

	   // Ensure fields which must end in a period do
	   if (VALID_PUNCTUATION.indexOf(spec.description[spec.description.length - 1]) === -1) {
		  cmdSpecErrors.push(`"description" field's value must end with punctuation (${VALID_PUNCTUATION_LIST_STR})`);
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
		  // [ key, expected type ]
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

		  // Check that keys which should end in periods do
		  if (VALID_PUNCTUATION.indexOf(argSpec.description[argSpec.description.length - 1]) === -1) {
			 errs.push(`"description" field's value must end with punctuation (${VALID_PUNCTUATION_LIST_STR})`);
		  }

		  // Default name to uppercase key
		  if (spec.name === undefined) {
			 argsSpec[key].name = key[0].toUpperCase() + key.substr(1);
		  }

		  // Push errors if they exist
		  if (errs.length > 0) {
			 argSpecErrors.push([key, errs]);
		  }
	   });

	   
	   if (argSpecErrors.length > 0) {
		  var errStrs = argSpecErrors.map((e) => {
			 return `error with "${e[0]}" argument specification: ${e[1].join(", ")}`;
		  });
		  cmdSpecErrors.push(errStrs.join(", "));
	   }

	   // Raise error with command if the command specification has errors.
	   if (cmdSpecErrors.length > 0) {
		  throw `Error registering the "${spec.name}" command: ${cmdSpecErrors.join(",")}`;
	   }

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

	   // Initialize class
	   super(client, spec);

	   this.spec = spec;
	   this.argsSpec = argsSpec;
    }

    /**
	* Runs custom argument parsing logic then runs the command's custom handler.
     */
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
					   msgParts.splice(i, 0, `<optional argument ${spec.name} not provided>`);
					   
					   return Promise.resolve();
				    } else {
					   runHandler = false;
					   return msg.channel.send(`\`${spec.name}\` argument required`);
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
				
				return msg.channel.send(`Error with \`${spec.name}\` argument, \
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
			 return msg.channel.send(`Oops, it looks like something went wrong. Don't worry my owner has already been informed.`);
		  });
    }

    /**
	* Default implementation of command handler method which lets developers know
	* their class isn't ready.
	*/
    command(msg, args) {
	   throw `"${this.spec.name}" command has not implemented the command() method`;
    }
}

/**
 * Argument which is a Discord user mention. Like @user.
 * Later this type will support fuzzy user matching but right now it does not.
 */
class DiscordUserArg {
    constructor(id, name, discriminator) {
	   this.id = id;
	   this.name = name;
	   this.discriminator = discriminator;
    }

    /**
	* @returns {String} - Discord user formatted with name and discriminator 
	*     but in a format which doesn't ping the user when sent to a chat.
	*/
    toString() {
	   return `${this.name}#${this.discriminator}`;
    }

    /**
	* Creates a DiscordUserArg from a message's text. 
	* @returns {DiscordUserArg}
	*/
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

    /**
	* Creates a DiscordUserArg which is the author of the sent message.
	* @returns {DiscordUserArg}
	*/
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

    /**
	* Tries to parse a Riot ID from text. Should be in the format username#tag.
	* @returns {RiotIDArg}
	*/
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

    /**
	* Returns a string representation of a Riot ID. In the format that users are
	* expected to give Riot IDs.
	* @returns {String}
	*/
    toString() {
	   return `${this.name}#${this.tag}`;
    }
}

/**
 * Integer argument type.
 * @returns {Number}
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
 * Positive integer argument type.
 * @returns {Number}
 */
function PositiveIntegerArg(value, msg) {
    value = value.replace(",", "");
    if (value.indexOf(".") !== -1) {
	   throw "Must be an integer value"
    }

    if (/[0-9]+/.test(value) === false) {
	   throw "Must be an integer value";
    }

    const i = parseInt(value);
    
    if (i < 0) {
	   throw "Must be a positive integer value";
    }

    return i;
}

/**
 * Match stored in the database.
 * @returns {Match}
 */
const MatchArg = {
    /**
	* Finds a match by the match_id field in the database.
	* @returns {Match}
	*/
    FromMsg: async (id) => {
	   return Match.findOne({ match_id: id });
    },

    /**
	* If there is only one match going on this match will be returned. If there
	* are multiple matches going on it will return an error asking the user to
	* enter the specific match_id and give then a list of ongoing match's and 
	* their IDs.
	* @returns {Match}
	*/
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

/**
 * Argument which specified date.
 */
const DateArg = {
    /**
	* Indicates what time a match should be scheduled. Can be: "today",
	* "tomorrow", "dd", "mm/dd", or "mm/dd/yyyy".
	* @returns {Date}
	*/
    FromMsg: (value, msg) => {
	   // Check if today or tomorrow
	   if (value === "today") {
		  return new Date();
	   } else if (value === "tomorrow") {
		  var d = new Date();
		  d.setDate(d.getDate() + 1);

		  return d;
	   }

	   // Check if a date
	   var dateParts = value.split("/");
	   const numSlashes = dateParts.length - 1;
	   if (numSlashes === 0) {
		  // Just the date.
		  var d = new Date();
		  d.setDate(dateParts[0]);

		  return d;
	   } else if (numSlashes === 1) {
		  // Month and date
		  var d = new Date();
		  d.setDate(dateParts[1]);
		  d.setMonth(dateParts[0]);

		  return d;
	   } else if (numSlashes === 2) {
		  // Month, date, and year
		  var d = new Date();
		  d.setDate(dateParts[1]);
		  d.setMonth(dateParts[0]);
		  d.setYear(dateParts[2]);

		  return d;
	   } else {
		  throw `Must either be a date in the american  format (\`dd\` or \`mm/dd\` or \`mm/dd/yyyy\`) or \`today\` or \`tomorrow\``;
	   }
    },

    /**
	* Defaults to the current day.
	* @returns {Date}
	*/
    DefaultToToday: (msg) => {
	   return new Date();
    },
};

module.exports = {
    Command: BaseCommand,
    DiscordUserArg,
    RiotIDArg,
    IntegerArg,
    PositiveIntegerArg,
    MatchArg,
    DateArg,
};
