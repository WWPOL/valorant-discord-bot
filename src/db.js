const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

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
    match_id: String,
    size: Number,
    signed_up: [ObjectId],
    teams: new Schema({
	   red: [ObjectId],
	   blue: [ObjectId],
    }),
    status: String,
    votes: new Schema({
	   time: [new Schema({
		  time: Number,
		  votes: Number,
	   })],
	   map: new Schema({
		  haven: Number,
		  bind: Number,
		  split: Number,
		  ascent: Number,
	   }),
    }),
    match_score: new Schema({
	   red_team_score: Number,
	   blue_team_score: Number,
	   winner: String,
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
});

var Match = mongoose.model("Match", MatchSchema);

module.exports = {
    User: User,
    Match: Match,
};
