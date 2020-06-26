# VALORANT Discord Bot
Bot to manage VALORANT players and games in a Discord.

# Table Of Contents
- [Overview](#overview)
- [Bot Usage](#bot-usage)
- [Development](#development)
- [Deployment](#deployment)

# Overview
Plan large games, make tier lists.

Version 0.2.0 of the bot is still under development. See the 
[`BRAINSTORMING.md`](BRAINSTORMING.md) file for planned features.

# Bot Usage
TBD.

# Development
## Dependencies
The following programs must be installed:

- [Node.js](https://nodejs.org)
- [Podman](https://podman.io) or [Docker](https://docker.com)
	
Install dependencies:

```
% npm install
```

## Configure
Configure secrets:

```
% cp src/secret.config.example.js src/secret.config.js
```

Then edit this file with your own values. To add the bot to your Discord server
see the comment at the top of this file.

## Run Bot
Start MongoDB:

```
% ./mongodb start
```

Run the bot:

```
% npm start
```

## Git Workflow
The `v0.2.0` branch should always be stable. Only push your code if you know
its good. 

# Deployment
**Version 0.2.0 is currently not deployed. The following section will be updated
when it is deployed.**

Currently the bot is deployed on funkyboy.zone.  

A read only deploy key was added to this repository to allow the server access.

See the [funkyboy.zone `valorant-discord-bot` Salt state](https://github.com/Noah-Huppert/funkyboy.zone/blob/master/salt/valorant-discord-bot/init.sls)
for details on how the bot is deployed.  

To deploy a newer version have a funkyboy.zone administrator run the 
`valorant-discord-bot` state.
