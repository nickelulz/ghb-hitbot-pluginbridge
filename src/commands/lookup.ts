import DiscordJS, { BaseCommandInteraction, Client, MessageEmbed } from "discord.js";
import Command from "../types/Command";
import Player from "../types/Player";
import { isContractor, findPlayerByIGN, load } from '../database'
import { COMMAND_ERROR_MESSAGES, NOT_FOUND_IMG_URL } from "../constants";

function contractorStatus(player: Player): string {
    if (isContractor(player))
        return "ð";
    else if (player.contractingCooldown > 0)
        return "âģ " + player.contractingCooldownString;
    else
        return "ðĒ";
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

        load();

        const player = findPlayerByIGN(String(interaction.options.get("ign")?.value));
        if (!player)
            response.setDescription(COMMAND_ERROR_MESSAGES.PLAYER_NOT_FOUND);
        else {
            const player_discord = await client.users.fetch(player.discordId);

            if (player_discord === undefined)
                response
                .setTitle('ðĄ PLAYER INFORMATION: ' + player.ign)
                .setDescription(
                    'ðŪ In-Game Name: ' + player.ign + '\n' +
                    'ðĪ UUID: ' + player.uuid + '\n' +
                    'ðŠ Verified hit kills: ' + player.killCount + '\n' +
                    'ðŠĶ Verified hit deaths: ' + player.deathCount + '\n' +
                    'ð° Morbiums: M$' + player.morbiums + '\n' +
                    'â Hit hiring cooldown: ' + player.hiringCooldownString + '\n' +
                    'â Contracting cooldown: ' + player.contractingCooldownString + '\n' +
                    'â Hit targetting cooldown: ' + player.targetingCooldownString + '\n' + 
                    '\`(Could not get discord information)\`'
                );
            else {
                let userIcon = player_discord.avatarURL();
                if (userIcon === null)
                    userIcon = NOT_FOUND_IMG_URL;

                response
                .setThumbnail(userIcon)
                .setTitle('ðĄ PLAYER INFORMATION: ' + player.ign)
                .setDescription(
                    'ðŪ In-Game Name: ' + player.ign + '\n' +
                    'ðĪ UUID: ' + player.uuid + '\n' +
                    'ð Discord Name: ' + player_discord.tag + '\n' +
                    'ðŠ Verified hit kills: ' + player.killCount + '\n' +
                    'ðŠĶ Verified hit deaths: ' + player.deathCount + '\n' +
                    'ð° Morbiums: M$' + player.morbiums + '\n' +
                    'â Hit hiring cooldown: ' + player.hiringCooldownString + '\n' +
                    'â Contracting cooldown: ' + player.contractingCooldownString + '\n' +
                    'â Hit targetting cooldown: ' + player.targetingCooldownString
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