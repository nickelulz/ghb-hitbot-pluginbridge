import { Client, Intents } from "discord.js";
import logger from "./logger";
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';
import { BOT_TOKEN } from './constants';
import Express, { Request, response, Response } from 'express';
import DiscordJS, { MessageEmbed } from 'discord.js';
import { Server } from './constants';
import Player from './types/Player';
import axios from 'axios'
import bodyParser from 'body-parser';

logger.info("Bot is starting...");

const registerEmbed = new MessageEmbed().setDescription("This is a test to see if the bot can correctly DM you! If it worked, You should now be registered.");

const server = Express();
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(bodyParser.raw());
server.listen(Server.ListenerPort, () => {
    logger.info('Bot now listening on port ' + Server.ListenerPort + ' at 127.0.0.1:' + Server.ListenerPort);
});

const client = new Client({
    intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES ]
});

export default client;

// initialize
export const api = axios.create({
    baseURL: 'http://127.0.0.1:' + Server.EndpointPort,
    proxy: false
})

ready(client);
interactionCreate(client);
client.login(BOT_TOKEN);

api.get('/init').then(() => {
    logger.info('Initialized connection with discord bot.');
}).catch((err) => { 
    logger.error(`Could not initialize with plugin. (Attempted to connect to 127.0.0.1:${Server.EndpointPort}/init)`);
    console.error(err);
});

server.get('/register/id/:id', (req: Request, res: Response) => {
    const id: string = req.params.id;
    if (direct_message_id(id, registerEmbed)) {
        const user_discord = client.users.cache.find(user => user.id == id)
        if (user_discord == undefined) {
            res.send("Could not find user at second level");
            return;
        } else {
            res.send(user_discord.id);
            return;
        }
    } else {
        res.send("Could not find user");
        return;
    }
});

server.post('/register/name', (req: Request, res: Response) => {
    const name = req.body["name"];
    if (direct_message_name(name, registerEmbed)) {
        const user = client.users.cache.find(user => user.tag === name);

        if (user === undefined) {
            res.sendStatus(500);
            logger.error('Could not find user ' + name);
            return;
        } else {
            res.send(user.id);
            return;
        }
    } else {
        logger.error('Could not DM user ' + name);
        res.sendStatus(500);
        return;
    }
});

server.post('/dm', (req: Request, res: Response) => {
    try {
        if (direct_message_id(req.body["id"], new MessageEmbed().setDescription(req.body["message"])))
            res.sendStatus(200);
        else
            res.sendStatus(500);
    } catch (err) {
        res.sendStatus(500);
    }
});

function direct_message_name(username: string, message: MessageEmbed): boolean {
    // DM hirer with contractor response
    const user_discord = client.users.cache.find(user => user.tag == username)
    if (user_discord === undefined) {
        logger.error(`Could not find a user matching name ${username} in bot cache, and could not DM.`);
        return false;
    }

    else {
        try {
            user_discord.send({ embeds: [ message ] });
        }
        catch (err: any) {
            logger.warn(`Cannot message user ${user_discord.username}.`);
            return false;
        }
    }
    return true;    
}

function direct_message_id(id: string, message: MessageEmbed): boolean {
    // DM hirer with contractor response
    const user_discord = client.users.cache.find(user => user.id == id);
    if (user_discord === undefined) {
        logger.error(`Could not find a user matching ID ${id} in bot cache, and could not DM.`);
        return false;
    }

    else {
        try {
            user_discord.send({ embeds: [ message ] });
            return true;
        }
        catch (err: any) {
            logger.warn(`Cannot message user ${user_discord.username}.`);
            return false;
        }
    }
}

function direct_message(user: Player, message: MessageEmbed): boolean {
    // DM hirer with contractor response
    const user_discord = client.users.cache.find(u => u.id == user.discordId);
    if (user_discord === undefined) {
        logger.error(`User ${user.ign} has an invalid discord ID not found in bot cache.`);
        return false;
    }

    else {
        try {
            user_discord.send({ embeds: [ message ] });
        }
        catch (err: any) {
            logger.warn(`Cannot message user ${user.ign}.`);
            return false;
        }
    }
    return true;
}