import DiscordJS, { BaseCommandInteraction, Client, MessageEmbed } from "discord.js";
import Command from "../types/Command";
import { isContractor, players, findPlayerByIGN, load } from '../database';
import Player from "../types/Player";
import { COMMAND_ERROR_MESSAGES, NOT_FOUND_IMG_URL } from "../constants";

function contractorStatus(player: Player): string {
    if (isContractor(player))
        return "🛑";
    else if (player.contractingCooldown > 0)
        return "⏳ " + player.contractingCooldownString;
    else
        return "🟢";
}

const Players: Command = {
    name: "players",
    description: "View the list of players registered on this bot.",
    type: "CHAT_INPUT",
    run: async (client: Client, interaction: BaseCommandInteraction) => {
        const response = new MessageEmbed();
        
        load();

        response.description = "";
        for (let i = 0; i < players.length; i++)
            response.description += (i+1) + ": " + players[i].ign + " " + contractorStatus(players[i]) + "\n";

        if (response.description === "")
            response.setDescription("❌ No players are currently registered on this discord bot.");
        else {
            response.setTitle("PLAYERS");
            response.description += '\n\`The emoji by the side of each name indicates their contractor status. 🛑 means they are currently a contractor, ⏳ means they are under cooldown, and 🟢 means they are ready to go!\`';
        }

        await interaction.followUp({
            ephemeral: true,
            embeds: [ response ]
        });
    }
};

export default Players;