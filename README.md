# VALORANT Discord Bot
Bot to manage VALORANT players and games in a Discord.

# Table Of Contents
- [Overview](#overview)
- [Bot Usage](#bot-usage)
- [Development](#development)

# Overview
Plan large games, make tier lists (TBD).

# Bot Usage
First tell the bot to start a game plan. You must specify a game size of either
`5` or `10`:

```
!plan <game size>
```

Then players can join the plan:

```
!join-plan
```

Players can also be added by name:

```
!join-plan @PlayerName#1234
```

Players can also leave the plan or be removed from the plan:

```
!leave-plan
!leave-plan @PlayerName#1234
```

At any time the plan's status can be viewed:

```
!list-plan
```

The plan can also be canceled:

```
!cancel-plan
```

This help text can be viewed with:

```
!plan-help
```

# Development
## Dependencies
The following programs must be installed:

- [Node.js](https://nodejs.org)
- [Podman](https://podman.io) or [Docker](https://docker.com)
  - Note: If you are using Docker you must set the `CONTAINER_CLI` environment
	variable to `docker`. This is required because by default the `redis` script
	uses Podman.
	
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
Start Redis:

```
% ./redis start
```

Run the bot (in another terminal):

```
% npm start
```

## Git Workflow
The `master` branch should always be stable. Only push your code if you know
its good. 
