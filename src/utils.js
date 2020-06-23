const redis = require("./redis");

function list_plan(planning) {
    return redis.smembers("user_ids").then((user_ids) => {
	   return redis.hgetall("users_info").then((users_info) => {
		  var out = "";

		  var i = 0;
		  for (;i < user_ids.length; i++) {
			 out += `${i+1}. ${users_info[user_ids[i]]}\n`;
		  }

		  for (; i < planning; i++) {
			 out += `${i+1}.\n`;
		  }

		  if (out.length === 0) {
			 out = `There are currently no players who have joined. ${planning} players must sign up to play.`;
		  }

		  return Promise.resolve(out);
	   });
    });
}

module.exports = {
    list_plan: list_plan,
};
