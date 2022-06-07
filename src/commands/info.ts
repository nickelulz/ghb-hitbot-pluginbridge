import DiscordJS, { BaseCommandInteraction, Client, MessageEmbed } from "discord.js";
import Command from "../types/Command";
import { Server } from "../constants";

const Info: Command = {
    name: "info",
    description: "Get the information regarding the server.",
    type: "CHAT_INPUT",
    run: async (client: Client, interaction: BaseCommandInteraction) => {
        const response = new MessageEmbed();
        
        response.setTitle("SERVER INFO").setDescription(`Address: \`${Server.DNS}\`\nVersion: ${Server.Version}\n\n` + Server.Rules);

        await interaction.followUp({
            ephemeral: true,
            embeds: [ response ]
        });
    }
}; 

export default Info;