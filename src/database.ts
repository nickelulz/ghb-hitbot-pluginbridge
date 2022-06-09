import { Server, DEBUG_MODE } from './constants'; 
import { api } from './main';
import Hit from './types/Hit';
import Bounty from './types/Bounty';
import Contract from './types/Contract';
import Player from './types/Player';
import logger from './logger';

export const hits: Hit[] = [];
export const players: Player[] = []; 

const cacheTime = 5 * 60 * 1000; // 5 min cachetime
let lastUpdated = 0;

export function load(): void {
    if (Date.now() > lastUpdated + cacheTime || (players.length == 0 && hits.length == 0)) {
        players.length = 0;
        hits.length = 0;

        api.get("/players").then(response => {
            if (response.status == 200)
                return response;
            else
                throw response.statusText;
        }).then(response => {
            lastUpdated = Date.now();
            lastUpdated = Math.min(lastUpdated, Date.now()); // Last updated time can't be in the future
            lastUpdated = Math.max(lastUpdated, Date.now() - cacheTime + 60000); // Wait at least 1 minute

            if (!(response.data == undefined || response.data == "")) {
                let players_JSON = response.data;
    
                if (players_JSON == undefined || players_JSON == "") {
                    logger.error('Could not load player database.');
                    return;
                }
    
                //console.log(players_JSON);
    
                for (let i = 0; i < players_JSON.length; i++) {
                    const discordId: string = players_JSON[i]["discordId"];
                    const ign: string = players_JSON[i]["username"];
                    const uuid: string = players_JSON[i]["uuid"];
                    const lastPlacedHit: string = players_JSON[i]["lastPlacedHit"];
                    const lastTargetedHit: string = players_JSON[i]["lastTargetedHit"];
                    const lastContractedHit: string = players_JSON[i]["lastContractedHit"];
                    const killCount: number = players_JSON[i]["kills"];
                    const deathCount: number = players_JSON[i]["deaths"];
                    const morbiums: number = players_JSON[i]["morbiums"];
                    players.push(new Player(discordId, uuid, ign, lastPlacedHit, lastTargetedHit, lastContractedHit, killCount, deathCount, morbiums));
                }
            }
    
            if (DEBUG_MODE) {
                logger.debug('Dumping players:');
                players.forEach(p => console.log(p.toString));
            }
    
            logger.info("Loaded current players JSON");
        }).then(() => {
            api.get("/activehits").then(response => {
                if (response.status == 200)
                    return response;
                else
                    throw response.statusText;
            }).then(response => {
                if (!(response.data == undefined || response.data == "")) {
                    let hits_JSON = response.data;
        
                    if (hits_JSON == undefined || hits_JSON == "") {
                        logger.error('Could not load player database.');
                        return;
                    }
        
                    parseJSONToArray(hits_JSON, hits);
                }
        
                if (DEBUG_MODE) {
                    logger.debug('Dumping hits:');
                    hits.forEach(h => console.log(h.toString));
                }
        
                logger.info("Loaded hits JSON");
            });
        });
    }
}

/**
 * Parses a JSON array and outputs it to a Hit array.
 * @param {JSON[]} json The JSON array to parse from.
 * @param {Hit[]} out The Hit array to output to.
 */
 function parseJSONToArray(json: any[], out: Hit[]) {
    for (let i = 0; i < json.length; i++) {
        const placer = findPlayerByIGN(json[i]["placer"]);
        const target = findPlayerByIGN(json[i]["target"]);
        const price: number = Number(json[i]["price"]);
        const datePlaced: Date = new Date(json[i]["timePlaced"]);
        const dateClaimed: Date | undefined = (json[i]["timeClaimed"] === "none") ? undefined : new Date(json[i]["timeClaimed"]);

        const claimer_raw = findPlayerByIGN(json[i]["claimer"]);
        const claimer: Player | undefined = (claimer_raw === false) ? undefined : claimer_raw; 

        const type: string = json[i]["type"];
        if (!placer)
            logger.error(`Invalid hit JSON at index ${i}. Placer ${json[i]["placer"]} not found in registry.`);
        else if (!target)
            logger.error(`Invalid hit JSON at index ${i}. Target ${json[i]["target"]} not found in registry.`);
        else {
            switch (type) {
                case "bounty":
                    out.push(new Bounty(placer, target, price, datePlaced, dateClaimed, claimer));
                    break;
                case "contract":
                    const contractor = findPlayerByIGN(json[i]["contractor"]);
                    const pending = Boolean(json[i]["pending"]);
                    if (!contractor)
                        logger.error(`Invalid contracted hit JSON at hit ${i}. Contractor ${json[i]["contractor"]} not found in registry.`);
                    else
                        out.push(new Contract(placer, target, price, datePlaced, contractor, pending, dateClaimed, claimer));
                    break;
            }
        }
    }
}

/**
 * Find a player from the database using a matching discord id.
 * @param {string} discordId The discord ID to match.
 * @returns {Player | false} The player that was found or false if not found.
 * @exports database.ts
 */
 export function findPlayerById(discordId: string): Player | false {
    for (let i = 0; i < players.length; i++)
        if (players[i].discordId === discordId)
            return players[i];
    return false;
};

/**
 * Find a player from the database using a matching in-game name.
 * @param {string} ign The in-game name to match.
 * @returns {Player | false} The player that was found or false if not found.
 * @exports database.ts
 */
export function findPlayerByIGN(ign: string): Player | false {
    for (let i = 0; i < players.length; i++)
        if (players[i].ign == ign)
            return players[i];
    return false;
}

/**
 * Find a contract from the hit database by matching the placer and the contractor.
 * @param {Player} placer The player that placed the hit.
 * @param {Player} contractor The player that is being contracted for the hit.
 * @returns {Contract | false} The hit that was found or false if not found.
 * @exports database.ts
 */
export function findContract(placer: Player, contractor: Player): Contract | false {
    for (let i = 0; i < hits.length; i++)
        if (hits[i] instanceof Contract && (<Contract> hits[i]).contractor.equals(contractor) && (<Contract> hits[i]).placer.equals(placer))
            return (<Contract> hits[i]);
    return false;
}

/**
 * Find a bounty from the hit database by matching the placer and the target.
 * @param {Player} placer The player that placed the hit.
 * @param {Player} target The player that is being contracted for the hit.
 * @returns {Bounty | false} The hit that was found or false if not found.
 * @exports database.ts
 */
export function findBounty(placer: Player, target: Player): Bounty | false {
    for (let i = 0; i < hits.length; i++)
        if (hits[i] instanceof Bounty && hits[i].placer.equals(placer) && hits[i].target.equals(target))
            return hits[i];
    return false;
}

/**
 * Finds a hit by matching only the target.
 * @param {Player} placer The player that placed the hit.
 * @returns {Hit | false} The first hit that was found or false if not found.
 * @exports database.ts
 */
export function findHitByTarget(target: Player): Hit | false {
    for (let i = 0; i < hits.length; i++)
        if (hits[i].target.equals(target))
            return hits[i];
    return false;
}

/**
 * Checks if a player is currently a target for a hit.
 * @param {Player} player The player to search for.
 * @returns {boolean} Whether or not the player is currently being targeted by a hit.
 * @exports database.ts
 */
export function isTarget(player: Player): boolean {
    for (let i = 0; i < hits.length; i++)
        if (hits[i].target.equals(player))
            return true;
    return false;
}

/**
 * Checks if a player is currently a contractor.
 * @param {Player} player The player to search for. 
 * @returns {boolean} Whether or not the player is currently a contractor for a hit.
 * @exports database.ts
 */
export function isContractor(player: Player): boolean {
    for (let i = 0; i < hits.length; i++)
        if (hits[i] instanceof Contract && (<Contract> hits[i]).contractor.equals(player) && !(<Contract> hits[i]).pending)
            return true;
    return false;
}

/**
 * Checks if a player currently has a placed hit on someone.
 * @param {Player} player The player to search for. 
 * @returns {boolean} Whether or not the player currently is a hirer for a hit on somebody.
 * @exports database.ts
 */
export function isHirer(player: Player): boolean {
    for (let i = 0; i < hits.length; i++)
        if (hits[i].placer.equals(player))
            return true;
    return false;
}