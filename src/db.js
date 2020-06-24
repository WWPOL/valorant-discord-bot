const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

module.exports = {
    User: mongoose.model("User", new Schema({
	   discord_id: String,
	   discord_discriminator: String,
	   riot_name: String,
	   riot_tag: String,
    })),
    Match: mongoose.model("Match", new Schema({
	   match_id: String,
	   size: Integer,
	   signed_up: [ObjectId],
	   teams: new Schema({
		  red: [ObjectId],
		  blue: [ObjectId],
	   }),
	   status: String,
	   votes: new Schema({
		  time: [new Schema({
			 time: Integer,
			 votes: Integer,
		  })],
		  map: new Schema({
			 haven: Integer,
			 bind: Integer,
			 split: Integer,
			 ascent: Integer,
		  }),
	   }),
	   match_score: new Schema({
		  red_team_score: Integer,
		  blue_team_score: Integer,
		  winner: String,
	   }),
	   user_scores: [new Schema({
		  user_id: ObjectId,
		  hero: String,
		  avg_combat_score: Integer,
		  kills: Integer,
		  deaths: Integer,
		  assists: Integer,
		  econ_rating: Integer,
		  first_bloods: Integer,
		  plants: Integer,
		  defuses: Integer,
	   })],
    })),
};
