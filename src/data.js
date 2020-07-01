const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const SUPPORTED_GAMES = {
    valorant: {
	   name: "VALORANT",
	   aliases: [ "v", "vally", "vallyorant" ],
	   customPlanMessage: `For VALORANT matches I can help with map voting and \
score keeping.`
    },
};

/*
Notes about data schemas:

- If a date is stored it is stored as a unix time stamp (milliseconds). Ignore 
  the time portion of the resulting date.
- If a time is stored it is stored as a unix time stamp (milliseconds).
*/

var UserSchema = new Schema({
    discord: new Schema({
	   id: String,
	   name: String,
	   discriminator: String,
    }),
    riot: new Schema({
	   name: String,
	   tag: String,
    }),
});

var User = mongoose.model("User", UserSchema);

var MatchSchema = new Schema({
    game: String,
    
    // Used to indicate which portions of the game_data key will be used. This
    // depends on knowing if the game field is actually a game we support with
    // additional features. The game_type field exists so that we can allow users
    // to input any game name they wish, and also know when they are playing a
    // game we officially support.
    game_type: {
	   type: String,
	   enum: Object.keys(SUPPORTED_GAMES).concat(["other"])
    },
    match_id: String,
    size: Number,
    signed_up: [ObjectId],
    teams: [new Schema({
	   captain: ObjectId,
	   members: [ObjectId],
    })],
    match_score: new Schema({
	   scores: new Schema({
		  team_captain: ObjectId,
		  score: Number,
	   }),
	   winning_captain: ObjectId,
    }),
    status: {
	   type: String,
	   enum: ["planning", "ongoing", "finished", "canceled"]
    },
    date: Number,
    votes: new Schema({
	   time: new Schema({
		  responses: [new Schema({
			 time: Number,
			 votes: Number,
		  })],
		  result: Number,
	   }),
    }),
    game_data: new Schema({
	   valorant: new Schema({
		  votes: new Schema({
			 map: new Schema({
				responses: new Schema({
				    haven: Number,
				    bind: Number,
				    split: Number,
				    ascent: Number,
				}),
				result: {
				    type: String,
				    enum: [ "haven", "bind", "split", "ascent" ]
				},
			 }),
		  }),
		  user_scores: [new Schema({
			 user_id: ObjectId,
			 hero: String,
			 avg_combat_score: Number,
			 kills: Number,
			 deaths: Number,
			 assists: Number,
			 econ_rating: Number,
			 first_bloods: Number,
			 plants: Number,
			 defuses: Number,
		  })],
	   }),
    }),
});

MatchSchema.statics.ParseGameType = function(game) {
    for (var k in SUPPORTED_GAMES) {
	   const g = SUPPORTED_GAMES[k];
	   
	   if (game === k || game === g.name || g.aliases.indexOf(game) !== -1) {
		  return k;
	   }
    }

    return "other";
};

MatchSchema.statics.ParseGame = function(game) {
    var key = MatchSchema.statics.ParseGameType(game);
    
    if (key !== "other") {
	   return SUPPORTED_GAMES[key].name;
    }

    return game;
};

MatchSchema.methods.pluralize = function(word) {
    if (this.size > 1) {
	   return `${word}s`;
    }

    return word;
};

MatchSchema.methods.statusList = async function() {
    var signedUpUsers = await User.find({
	   "_id": {
		  $in: this.signed_up,
	   }
    });
    signedUpUsers = signedUpUsers.reverse(); // MongoDB join query returns the reversed order

    var signedUpList = []
    var waitListed = [];

    for (var i = 0; i < signedUpUsers.length || i < this.size; i++) {
	   if (i < signedUpUsers.length && i < this.size) {
		  // If user is not on the wait list
		  signedUpList.push(`${i+1}. ${signedUpUsers[i].discord.name}`);
	   } else if (i < signedUpUsers.length && i > this.size - 1) {
		  // If user is on the wait list
		  waitListed.push(signedUpUsers[i].discord.name);
	   } else {
		  // Empty spot in match plan
		  signedUpList.push(`${i+1}.`);
	   }
    }

    console.log(signedUpUsers);

    if (waitListed.length > 0) {
	   signedUpList.push(`\nWaitlisted: ${waitListed.join(", ")}`);
    }

    return signedUpList;
};

var Match = mongoose.model("Match", MatchSchema);

module.exports = {
    SUPPORTED_GAMES, User, Match,
};
