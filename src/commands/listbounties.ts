import DiscordJS, { BaseCommandInteraction, Client, MessageEmbed } from "discord.js";
import Command from "../types/Command";
import { hits, load } from '../database';
import Bounty from '../types/Bounty';

const ListBounties: Command = {
    name: "listbounties",
    description: "Acts as the documentation for this bot.",
    type: "CHAT_INPUT",
    run: async (client: Client, interaction: BaseCommandInteraction) => {
        const response = new DiscordJS.MessageEmbed().setDescription("");

        load();

        let counter = 1;
        for (let i = 0; i < hits.length; i++)
            if (hits[i] instanceof Bounty)
                response.description += counter++ + ": " + hits[i].toSimpleString;
        if (response.description == "")
            response.setDescription("❌ There are no bounties currently placed.");
        else
            response.setTitle("Ongoing Bounties");

        await interaction.followUp({
            ephemeral: true,
            embeds: [ response ]
        });
    }
}

export default ListBounties;
