import DiscordJS, { BaseCommandInteraction, Client, MessageEmbed } from "discord.js";
import Command from "../types/Command";

const Help: Command = {
    name: "help",
    description: "Acts as the documentation for this bot.",
    type: "CHAT_INPUT",
    options: [
        {
            name: "command",
            description: "The specific command you want help with.",
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
        }
    ],
    run: async (client: Client, interaction: BaseCommandInteraction) => {
        const response = new MessageEmbed();
        const commandMode = String(interaction.options.get("command")?.value);
        if (commandMode === "undefined" || commandMode === undefined)
        {
            response
            .setTitle("COMMANDS")
            .setDescription(
                // All Access
                "▸ help\n" +
                "▸ leaderboards\n" +
                "▸ listbounties\n" +
                "▸ listplayers\n" +
                "▸ lookup [?playername]\n" +
                "▸ info\n" +
                "▸ status\n\n"
            );
        }
        else
        {
            switch (commandMode)
            {
                case "help":
                    response.setTitle("HELP") .setDescription("The command you\'re using right now! It will list either all of the commands, or list detailed information about each command.");
                    break;

                case "hello":
                    response.setTitle("HELLO").setDescription("Returns a cool greeting.");
                    break;

                case "leaderboards":
                    response.setTitle("LEADERBOARDS").setDescription("List out the rankings of players by the most verified kills by hit and most verified deaths by hit.");
                    break;

                case "players":
                    response.setTitle("PLAYERS").setDescription("This command is used for getting information about the *registered* players on this bot. Without specifying a \`player\`, it will simply return a list of players on this bot with indications on their cooldown statuses for contracting hits, placing hits, and being targetted, but by using \`/players player:[ign]\` it will return detailed information about the selected player in particular.\n\n\`Usage: /players [optional player:playername]\`");

                case "serverinfo":
                    response.setTitle("SERVERINFO").setDescription("Displays all of the preset server information, such as the IP address and PORT or DNS, the server version, and the server rules (which can be checked out using \`/rules\` as well.");
                    break;

                case "status":
                    response.setTitle("STATUS").setDescription("Fetches and displays the status of the server using the API \`api.mcsrvstat.us\`. It will list whether the server is up, and if it is, it will list the amount of players currently online.");
                    break;

                case "admin":
                    response.setTitle("ADMIN").setDescription("Used to give/remove admin. **Requires you to be the root administrator.** Usage: \`/admin mode:[give/remove] ign:[The IGN of the user to give/remove administrator access]\`");
                    break;

                default:
                    response.setDescription("Make sure to set the name of the command correctly. Remember, it is case sensitive.");
                    break;
            }
        }

        await interaction.followUp({
            ephemeral: true,
            embeds: [ response ]
        });
    }
};

export default Help;
