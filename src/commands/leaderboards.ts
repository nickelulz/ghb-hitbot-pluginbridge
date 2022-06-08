import { BaseCommandInteraction, Client, MessageEmbed } from "discord.js";
import Command from "../types/Command";
import { players, load } from '../database'
import Player from "../types/Player"

const Leaderboards: Command = {
    name: "leaderboards",
    description: "Lists out the leaderboards for kills and deaths (descending)",
    type: "CHAT_INPUT",
    run: async (client: Client, interaction: BaseCommandInteraction) => {
        let killsEmbed = new MessageEmbed(), deathsEmbed = new MessageEmbed(), morbiumsEmbed = new MessageEmbed();

        load();

        if (players.length == 0) {
            killsEmbed.setDescription("❌ No players are currently registered!");
        }
        else {
            let deathRankings: Player[] = players;
            let killRankings: Player[] = players;
            let morbiumsRankings: Player[] = players;

            sort(deathRankings, 1);
            sort(killRankings, 0);
            sort(morbiumsRankings, 2);

            killsEmbed.setTitle("SUCCESSFULLY PLACED HITS (KILLS)");
            killsEmbed.description = "";
            for (let i = 0; i < killRankings.length; i++)
                killsEmbed.description += `${i+1}: ${killRankings[i].ign} - ${killRankings[i].killCount}\n`;

            deathsEmbed.setTitle("TIMES TARGETTED SUCCESSFULLY (DEATHS)");
            deathsEmbed.description = "";
            for (let i = 0; i < deathRankings.length; i++)
                deathsEmbed.description += `${i+1}: ${deathRankings[i].ign} - ${deathRankings[i].deathCount}\n`;

            morbiumsEmbed.setTitle("MORBIUMS");
            morbiumsEmbed.description = "";
            for (let i = 0; i < morbiumsRankings.length; i++)
                morbiumsEmbed.description += `${i+1}: ${morbiumsRankings[i].ign} - M$${morbiumsRankings[i].morbiums}\n`;
        }

        const embeds: MessageEmbed[] = (players.length == 0) ? [ killsEmbed ]  :  [ killsEmbed, deathsEmbed ];

        await interaction.followUp({
            ephemeral: true,
            embeds: embeds
        });
    }
}; 

/**
 * Sorts player arrays based on kills or deaths.
 * @param {Player[]} arr The array to be sorted
 * @param {number} mode 0->killCount 1->deathCount 
 */
function sort(arr: Player[], mode: number) {
    for (let i = 0; i < arr.length-1; i++) {
        let min = i;
        for (let j = i+1; j < arr.length; j++)
            if (sortHeiristic(mode, arr[i], arr[j]))
                min = j;
        let temp = arr[i];
        arr[i] = arr[min];
        arr[min] = temp;
    }
}

function sortHeiristic(mode: number, a: Player, b: Player) {
    switch (mode) {
        case 0: // deaths
            return a.deathCount < b.deathCount;

        case 1: // kills
            return a.killCount < b.killCount;

        case 2: // morbiums
            return a.morbiums < b.morbiums;

        default:
            return false;
    }
}

export default Leaderboards;