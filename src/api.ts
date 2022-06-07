import Express, { Request, response, Response } from 'express';
import DiscordJS, { MessageEmbed } from 'discord.js';
import { Server } from './constants';
import Player from './types/Player';
import client from './main';
import logger from './logger';
import axios from 'axios';

const registerEmbed = new MessageEmbed().setDescription("This is a test to see if the bot can correctly DM you! If it worked, You should now be registered.");

const server = Express();
server.listen(Server.ListenerPort);

server.get('/register/id/:id', (req: Request, res: Response) => {
    const id: string = req.params.name;
    if (direct_message_id(id, registerEmbed)) {
        client.users.fetch(id).then((user_discord: DiscordJS.User | undefined) => {
            if (user_discord == undefined) {
                res.sendStatus(500);
                return;
            } else {
                res.send(user_discord.id);
                return;
            }
        });
    } else {
        res.sendStatus(500);
        return;
    }
});

server.get('/register/name/:name', (req: Request, res: Response) => {
    const name: string = req.params.name;
    if (direct_message_name(name, registerEmbed)) {
        const user = client.users.cache.find(user => user.username === name);
        if (user === undefined) {
            res.sendStatus(500);
            return;
        } else {
            res.send(user.id);
            return;
        }
    } else {
        res.sendStatus(500);
        return;
    }
});

function direct_message_name(username: string, message: MessageEmbed): boolean {
    // DM hirer with contractor response
    Promise.resolve(client.users.cache.find(user => user.username === username)).then((user_discord: DiscordJS.User | undefined) => {
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
    });

    return true;    
}

function direct_message_id(id: string, message: MessageEmbed): boolean {
    // DM hirer with contractor response
    Promise.resolve(client.users.fetch(id)).then((user_discord: DiscordJS.User | undefined) => {
        if (user_discord === undefined) {
            logger.error(`Could not find a user matching ID ${id} in bot cache, and could not DM.`);
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
    });

    return true;
}

function direct_message(user: Player, message: MessageEmbed): boolean {
    // DM hirer with contractor response
    Promise.resolve(client.users.fetch(user.discordId)).then((user_discord: DiscordJS.User | undefined) => {
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
    });

    return true;
}