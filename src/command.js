const { Command } = require("discord.js-commando");

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
 * The command specification can contain an `args` field which should be an object
 * who's keys are the name of the key which the argument value will be stored and
 * values are argument specification objects. These objects can have the 
 * following keys:
 *
 * - name (String, Optional): User friendly name of argument. If not provided this
 *       defaults to the `key` field with its first letter capitalized.
 * - type (Function/Class): Asynchronous function / class constuctor which is 
 *       called with the string value of the argument and the Discord Message, it 
 *       is expected to return the argument converted into the type.
 * - help (String): Help describing argument.
 * - optional (Boolean, Optional): If true the argument won't be required.
 * - default (Function/Class, Optional): Asynchronous function / class construction
 *       which is called with the Discord Message object and should return a
 *       default value. Can only be provided if `optional` is true.
 *
 * For example:
 * ```
 * {
 *     args: {
 *         foobar: {
 *             name: "Foo Bar",
 *             type: Number,
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
		  const spec = argsSpec[key];

		  var pre = "";
		  var post = "";
		  if (spec.optional === true) {
			 pre = "[";
			 post = "]";
		  }

		  return `${pre}<${spec.name}>${post}`
	   }).join(" ");

	   if (Object.keys(argsSpec).length > 0) {
		  if (spec.details === undefined) {
			 spec.details = `*N/A*\n**Arguments:**\n`;
		  } else {
			 spec.details += "\n**Arguments:**\n";
		  }
		  
		  spec.details += Object.keys(argsSpec).map((key) => {
			 const spec = argsSpec[key];

			 var pre = "";
			 var post = "";
			 var optmsg = "";
			 if (spec.optional === true) {
				pre = "[";
				post = "]";
				optmsg = " (Optional)";
			 }	 

			 return `- \`${pre}<${spec.name}>${post}\` ${optmsg}: ${spec.help}`;
		  }).join("\n");
	   }
	   
	   super(client, spec);

	   this.argsSpec = argsSpec;
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
				return msg.reply(`Error with \`${spec.name}\` argument, \
was \`${msgParts[i]}\`: ${e}`);
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
}

/**
 * Discord User argument type
 */
class DiscordUser {
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

			 return Promise.resolve(new DiscordUser(userID, user.username,
											user.discriminator));
		  })
		  .catch((e) => {
			 console.error(`Failed to find user "${userID}"`, e);
			 return Promise.reject("Failed to find user mentioned");
		  });
    }

    static DefaultToAuthor(msg) {
	   return new DiscordUser(msg.author.id, msg.author.username,
						 msg.author.discriminator);
    }
}

/**
 * Riot ID argument type.
 */
class RiotID {
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

	   return new RiotID(parts[0], parts[1]);
    }
}

module.exports = { DiscordUser, RiotID, Command: BaseCommand };
