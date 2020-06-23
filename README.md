# VALORANT Discord Bot
Bot to manage VALORANT players and games in a Discord.

# Table Of Contents
- [Overview](#overview)
- [Development](#development)

# Overview
Plan large games, make tier lists.

# Development
The following programs must be installed:

- [Node.js](https://nodejs.org)
- [Podman](https://podman.io) or [Docker](https://docker.com)
  - Note: If you are using Docker you must set the `CONTAINER_CLI` environment
	variable to `docker`.
	
Install dependencies:

```
% npm install
```

Configure secrets:

```
% cp src/secret.config.example.js src/secret.config.js
```

Then edit this file with your own values. To add the bot to your Discord server
see the comment at the top of this file.

Start Redis:

```
% ./redis start
```

Run the bot (in another terminal):

```
% npm start
```
