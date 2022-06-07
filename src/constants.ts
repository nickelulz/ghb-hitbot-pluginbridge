import dotenv from 'dotenv';
import logger from './logger';

/**
 * The amount of cooldown time for buffering between hiring each hit
 * in minutes. Default is 2 hours.
 * 
 * @type number
 * @constant
 */
 export const HIRING_COOLDOWN: number = 120;

 /**
  * The amount of cooldown time for buffering between contracting for
  * each hit in minutes. Default is 2 hours.
  * 
  * @type number
  * @constant
  */
 export const CONTRACTING_COOLDOWN: number = 120;
 
 /**
  * The amount of cooldown time for buffering between being targetted on
  * each hit in minutes. Default is 4 hours.
  * 
  * @type number
  * @constant
  */
 export const TARGETING_COOLDOWN: number = 240;

/**
 * Default "image not found"/Error 404 Image URL for embeds and whatnot.
 * 
 * @type string
 * @constant
 */
export const NOT_FOUND_IMG_URL: string = "https://media.istockphoto.com/vectors/error-document-icon-vector-id1062127004?k=6&m=1062127004&s=612x612&w=0&h=94D4dEDZzXuNQ0rhw7yftXb259wNpjDMoNmcl9KvUD8="; 

/**
 * Command error messages used to edit messages across several commands.
 * @type JSON
 * @constant
 */
export const COMMAND_ERROR_MESSAGES = {
    /**
     * User is not registered with the bot, and command requires registry.
     */
    NOT_REGISTERED: "❌ You are not a registered user! Use \`/register\` to register to use this command!",

    /**
     * User is not an administrator, and command requires administrator permissions.
     */
    NOT_ADMIN: "❌ This command requires administrator permissions, and you aren'\t an admin.",

    /**
     * User is not the root administrator, and this command requires root administrator level permissions.
     */
    NOT_ROOT_ADMIN: "❌ You are not the **root** admin! (Only the bot configuration manager has root access!)",

    /**
     * Target field is undefined.
     */
    NO_TARGET: "❌ You must set a target.",

    /**
     * Target (of hit) is not found in registry.
     */
    TARGET_NOT_FOUND: "❌ The target was not found in the player registry. Make sure you are spelling the name correctly, with correct capitalization.",

    /**
     * Hirer field is undefined.
     */
    NO_HIRER: "❌ You have to specify the hirer.",

    /**
     * Hirer of a hit is not registered/not found in player registry.
     */
    HIRER_NOT_FOUND: "❌ The hirer of this hit is not a registered user. (And therefore, not found in the registry.)",

    /**
     * Contractor field is undefined.
     */
    NO_CONTRACTOR: "❌ You have to set a contractor!",

    /**
     * Contractor is not found in player registry.
     */
    CONTRACTOR_NOT_FOUND: "❌ The contractor was not found in the registry. Make sure you are spelling their name correctly, otherwise they are not a registered user.",

    /**
     * Contract is not found in hit database.
     */
    CONTRACT_NOT_FOUND: "❌ The contract you intend to remove was not found. Make sure that you are matching the players correctly, and check with \`/listbounties\`. Alternatively, you might have already removed it. :)",

    /**
     * Player not found in player database.
     */
    PLAYER_NOT_FOUND: "❌ The player you selected was not found in the registry. Make sure you spelled the name correctly with correct capitalization.",
}

const SERVER_RULES: string = '**Rules (and other non-rules):**\n' +
'1. No hacking/cheating. (No illegal game modifications. You can use any of these mods, though: *Litematica, Optifine, ShulkerboxTooltips, Badlion, Lunar, MiniHud* or etc. Just ask if you aren\'t sure. No XRay.\n\n' +
'2. No griefing or stealing.\n\n' + 
'3. Don\'t exploit bugs in the hit system. Use it as intended.\n\n' +
'4. If you find the end portal, you have to share the coordinates and you can\'t fight the dragon until everyone agrees to it. You can have all of the loot in the stronghold, though.\n\n' +
'5. No conspiring with others to gang up on hits. Hits are meant to be 1v1 fair fights each time.\n\n' +
'6. Once the ender dragon is defeated, the seed is released and you can use ChunkBase and etc as much as you\'d like. These services are banned prior to this.\n\n' +
'7. Breaking the rules of the server is punishable by just light court sentences (paying diamonds, usually) for small stuff (like hit or land disputes) and getting banned from this server and future servers for big stuff (server wide grief)\n\n' +
'8. People have a land claim (as in they control everything from bedrock to build limit) within 200 blocks radius of their base. This only applies if they are not within the 300 block radius of spawn, however. This also doesn\'t apply if they specifically state the borders of their base.';

/**
 * DO NOT CONFIGURE BEYOND HERE,
 * EVERYTHING BELOW NEEDS TO BE CONFIGURED
 * IN .env
 */

// Load .env
const env = dotenv.config();
if (env.error)
        throw env.error;

// environment/private variables
export const BOT_TOKEN = process.env.TOKEN;
export const ADMIN_TOKEN: string = (process.env.ADMIN_TOKEN === undefined || process.env.ADMIN_TOKEN.trim() === "") ? noRootAdmin() : process.env.ADMIN_TOKEN;
const SERVER_PORT: number = (process.env.SERVER_PORT === undefined || process.env.SERVER_PORT.trim() === "") ? noPort() : Number(process.env.SERVER_PORT);
const PLUGIN_PORT: number = (process.env.PLUGIN_PORT === undefined || process.env.PLUGIN_PORT.trim() === "") ? noPluginPort() : Number(process.env.PLUGIN_PORT);
const SERVER_ADDRESS: string = (process.env.SERVER_ADDRESS === undefined || process.env.SERVER_ADDRESS.trim() === "") ? noAddress() : process.env.SERVER_ADDRESS;
const SERVER_PATH: string = (process.env.SERVER_PATH === undefined || process.env.SERVER_PATH.trim() === "") ? noPath() : process.env.SERVER_PATH;
const SERVER_VERSION = (process.env.SERVER_VERSION === undefined || process.env.SERVER_VERSION.trim() === "") ? noVersion() : process.env.SERVER_VERSION;
const SERVER_DNS = (process.env.SERVER_DNS === undefined || process.env.SERVER_DNS.trim() === "") ? noDNS() : process.env.SERVER_DNS;
const LISTENER_PORT: number = (process.env.LISTENER_PORT === undefined || process.env.LISTENER_PORT.trim() === "") ? noListenerPort() : Number(process.env.LISTENER_PORT);

/**
 * JSON object representing the Server,
 * packages up all of the data into 5
 * internal data fields: 'Port', 'Address',
 * 'Version', 'Path' and 'DNS'.
 * 
 * @type JSON
 * @constant
 */
export const Server = {
    Port: SERVER_PORT,
    EndpointPort: PLUGIN_PORT,
    ListenerPort: LISTENER_PORT,
    Address: SERVER_ADDRESS,
    Version: SERVER_VERSION,
    Path: SERVER_PATH,
    DNS: SERVER_DNS,
    Rules: SERVER_RULES
}

/**
 * Warns that the listener port is not set in .env and returns default.
 * @returns {number} Default listener port (3225)
 */
function noListenerPort() {
    logger.warn("No listener port set. Setting as default (3225)");
    return 3225;
}

/**
 * Warns that the plugin port is not set in .env and returns the default.
 * @returns {number} Default plugin port (3125)
 */
function noPluginPort() {
    logger.warn("No plugin endpoint port set. Setting as default (3125)");
    return 3125;
}

/**
 * Warns that the Root Admin is not set in .env and returns a placeholder.
 * @returns {string} Default Root Admin Placeholder.
 */
function noRootAdmin(): string {
    logger.warn("No root admin set.");
    return "NONE";
}

/**
 * Warns that the PORT for the server is not set and sets the default port instead.
 * @returns {number} Default Minecaft Port (25565)
 */
function noPort(): number {
    logger.warn("Server PORT not set. Setting as default (25565)");
    return 25565;
}

/**
 * Errors that there the Server Address is not set in .env and returns a placeholder.
 * @returns {string} Default Server Address Placeholder. ("NONE")
 */
function noAddress(): string {
    logger.error("Server ADDRESS is not set.");
    return "NONE";
}

/**
 * Errors that the Server executable PATH is not set in .env and returns a placeholder.
 * @returns {string} Default Server Starting Path Placeholder ("NONE").
 */
function noPath(): string {
    logger.error("Server executable PATH not set.");
    return "NONE";
}

/**
 * Warns that the Server Version is not set in .env and returns a placeholder.
 * @returns {string} Default Server Version placeholder ("latest/implicit") 
 */
function noVersion() {
    logger.warn("Server VERSION not set.");
    return "latest/implicit";
}

/**
 * Warns that the Server DNS is not set in .env and returns the Server 
 * Address and the Server PORT as a placeholder.
 * @returns {string} Default Server DNS placeholder: SERVER_ADDRESS:SERVER_PORT
 */
function noDNS() {
    logger.warn("Server DNS not set. Using server PORT and ADDRESS.");
    return SERVER_ADDRESS + ":" + SERVER_PORT;
}