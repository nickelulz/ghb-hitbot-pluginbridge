import DiscordJS, { BaseCommandInteraction, Client, MessageEmbed } from "discord.js";
import Command from "../types/Command";
import Player from "../types/Player";
import { isContractor, findPlayerByIGN } from '../database'
import { COMMAND_ERROR_MESSAGES, NOT_FOUND_IMG_URL } from "../constants";

function contractorStatus(player: Player): string {
    if (isContractor(player))
        return "🛑";
    else if (player.contractingCooldown > 0)
        return "⏳ " + player.contractingCooldownString;
    else
        return "🟢";
}

const Lookup: Command = {
    name: "lookup",
    description: "Lookup information about a registered player.",
    type: "CHAT_INPUT",
    options: [
        {
            name: "ign",
            description: "The ign of the player to lookup",
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
        }
    ],
    run: async (client: Client, interaction: BaseCommandInteraction) => {
        const response = new MessageEmbed();
        const player = findPlayerByIGN(String(interaction.options.get("ign")?.value));
        if (!player)
            response.setDescription(COMMAND_ERROR_MESSAGES.PLAYER_NOT_FOUND);
        else {
            const player_discord = await client.users.fetch(player.discordId);

            if (player_discord === undefined)
                response.setDescription
            else {
                let userIcon = player_discord.avatarURL();
                if (userIcon === null)
                    userIcon = NOT_FOUND_IMG_URL;

                response
                .setThumbnail(userIcon)
                .setTitle('💡 PLAYER INFORMATION: ' + player.ign)
                .setDescription(
                    '🎮 In-Game Name: ' + player.ign + '\n' +
                    '📓 Discord Name: ' + player_discord.tag + '\n' +
                    '🔪 Verified hit kills: ' + player.killCount + '\n' +
                    '🪦 Verified hit deaths: ' + player.deathCount + '\n' +
                    '⌛ Hit hiring cooldown: ' + player.hiringCooldownString + '\n' +
                    '⌛ Contracting cooldown: ' + player.contractingCooldownString + '\n' +
                    '⌛ Hit targetting cooldown: ' + player.targetingCooldownString
                );
            }
        }

        await interaction.followUp({
            ephemeral: true,
            embeds: [ response ]
        });
    }
};

export default Lookup;