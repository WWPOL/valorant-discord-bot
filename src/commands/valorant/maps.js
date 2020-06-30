const { Command, MatchArg, OneOfArg } = require("../../command");
const { SUPPORTED_GAMES } = require("../../data");

const MAPIMAGES = {
    "bind":"https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltad4274632c983531/5ecd64d04d187c101f3f2486/bind-minimap-2.png",
    "haven":"https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltedb5d57941e4f3f5/5ecd64c14d187c101f3f2484/haven-minimap-2.png",
    "split":"https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt2caea7a88362d6aa/5ecd64b0817e574fa1dcc162/split-minimap-2.png",
    "ascent":"https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt47bef6aa9e43d8ec/5ecd64df96a8996de38bbf8f/ascent-minimap-2.jpg",
}

class MapsCommand extends Command {
    constructor(client) {
        super(client, {
            name: "maps",
            description: "Displays pictures of Valorant maps.",
            args: {
                gameMap: {
                    type: OneOfArg(SUPPORTED_GAMES.valorant.maps),
                    description: "Valorant map to be displayed.",
                    optional: true,
                },
            },
        });
    }

    async command(msg, { gameMap }) {
            
           
            return msg.channel.send(`${MAPIMAGES[gameMap]}`);
    }

}

module.exports = MapsCommand;