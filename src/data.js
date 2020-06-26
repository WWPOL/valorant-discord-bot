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
    status: { type: String, enum: ["planning", "ongoing", "finished"] },
    votes: new Schema({
	   time: [new Schema({
		  time: Number,
		  votes: Number,
	   })],
    }),
    game_data: new Schema({
	   valorant: new Schema({
		  votes: new Schema({
			 map: new Schema({
				haven: Number,
				bind: Number,
				split: Number,
				ascent: Number,
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

MatchSchema.statics.ParseGameType = (game) => {
    for (var k in SUPPORTED_GAMES) {
	   const g = SUPPORTED_GAMES[k];
	   
	   if (game === k || game === g.name || g.aliases.indexOf(game) !== -1) {
		  return k;
	   }
    }

    return "other";
};

MatchSchema.statics.ParseGame = (game) => {
    var key = MatchSchema.statics.ParseGameType(game);
    
    if (key !== "other") {
	   return SUPPORTED_GAMES[key].name;
    }

    return game;
};

var Match = mongoose.model("Match", MatchSchema);

module.exports = {
    SUPPORTED_GAMES, User, Match,
};
