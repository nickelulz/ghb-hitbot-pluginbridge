import DiscordJS, { BaseCommandInteraction, Client, MessageEmbed } from "discord.js";
import Command from "../types/Command";
import { Server } from "../constants";
import { getServerStatus } from "../server";

const Status: Command = {
    name: "server",
    description: "The blanket command for everything having to deal with the server.",
    type: "CHAT_INPUT",
    run: async (client: Client, interaction: BaseCommandInteraction) => {
        const response = new MessageEmbed();
        
        const data = getServerStatus();
        response.setTitle("STATUS").setDescription((data.online) ? "The server is *online*" : "The server is *offline*");

        if (data.online) {
            response.description += `\n\nPlayers: ${data.players.online}/${data.players.max} players online.\n`;
            if ('players' in data && 'list' in data.players)
                for (let i = 0; i < data.players.list.length; i++)
                    response.description += data.players.list[i] + "\n";
        }

        await interaction.followUp({
            ephemeral: true,
            embeds: [ response ]
        });
    }
}; 

export default Status;