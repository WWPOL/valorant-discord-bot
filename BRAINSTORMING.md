# Brainstorming
Bot brainstorming.

# Table Of Contents
- [Behavior](#behavior)
- [Commands](#commands)
- [Data Model](#data-model)

# Behavior
- Allow multiple games to be planned at once
- Help plan when game will take place
- Notify users when game is about to start
- Help place users onto teams
- Automatically move teams to different voice channels
- Record scores of completed games

# Commands
`@bot register [@<user>] <riot ID>`  
	Associate Discord user with Riot account
	
`@bot who @<user>`  
	Get the Riot ID of a Discord user
	
`@bot plan <number of players>`  
	Start a match plan
	
`@bot status [<match ID>]`  
	Show the status of a match plan
	
`@bot join [@<user>] [<match ID>]`  
	Join a match plan
	
`@bot leave [@<user>] [<match ID>]`  
	Leave a match plan
	
`@bot when [<match ID>]`  
	Get the time a match will occur
	
`@bot schedule [<match ID>] today|mm/dd/yy`  
	Send a scheduling message which polls users about when they are available to
	play the match.

`@bot map [<match ID>] vote|bind|split|ascend|haven`  
	Sets the map or calls a vote for the map
	
`@bot team @<user> red|blue [<match ID>]`  
	Assign a user to a team
	
`@bot notify [<match ID>]`  
	Notify users who are not already in a voice channel that the match is going
	to start soon

`@bot start [<match ID>]`  
	Move users to voice channels

`@bot score [<match ID>] (image attached)`  
	Process a match score screenshot and record the results

`@bot matches all|finished|upcoming`  
	Gets matches which fit a criteria

# Data Model
Mongo DB.

Users:  

- Discord ID (PK, String)
- Discord Discriminator (String)
- Riot Name (String)
- Riot Tag (String)
	
Matches:  

- Match ID (PK, String)
- Size (Integer)
- Signed Up (List[String]): Discord IDs
- Teams (Object)
	- Red Team (List[String]): Discord IDs
	- Blue Team (List[String]): Discord IDs
- Status (String): Either "planning", "ongoing", or "finished"
- Votes (Object)
	- Time (Object)
		- <numbers 0-23> (Object)
			- votes (Integer)
	- Map (Object)
		- Haven (Integer)
		- Bind (Integer)
		- Split (Integer)
		- Ascent (Integer)
- Match Score (Object)
	- Red team score (Object)
	- Blue team score (Object)
	- Winner (String): Either "blue" or "red"
- User Scores (Object)
	- <Discord ID> (String): A key will exist for each user in the match
		- Hero (String)
		- Average combat score (Integer)
		- Kills (Integer)
		- Deaths (Integer)
		- Assists (Integer)
		- Econ rating (Integer)
		- First bloods (Integer)
		- Plants (Integer)
		- Defuses (Integer)
