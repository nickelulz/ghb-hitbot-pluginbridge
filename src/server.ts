import { Server } from './constants'; 
import Hit from './types/Hit';
import Bounty from './types/Bounty';
import Contract from './types/Contract';
import Player from './types/Player';
import logger from './logger';
import axios from 'axios';

// 5 min cache time
const cacheTime = 5 * 60 * 1000;
let data: any, lastUpdated = 0;
const API_URL = 'https://api.mcsrvstat.us/2/' + ((Server.Port == 25565) ? Server.DNS : (Server.Address + ':' + Server.Port));

/**
 * Fetches the raw JSON data from the end API (api.mcsrvstat.us).
 * @returns {JSON} The raw JSON data response.
 */
const fetchStatusJSON = function (): any {
    return axios.get(API_URL)
            .then(response => {
                if (response.status == 200)
                    return response;
                else
                    throw response.statusText;
            })
            .then(response => response.data);
}

/**
 * Updates and obtains the raw JSON status of the server.
 * @returns {JSON} The JSON response data of the server.
 */
export const getServerStatus = function (): any {
    logger.info("Fetching server information.");
    // Cache expired/doesn't exist
    if (Date.now() > lastUpdated + cacheTime || data === undefined) {
        return fetchStatusJSON()
            .then((body: any) => {
                data = body;
                lastUpdated = body.last_updated * 1000 || Date.now();
                lastUpdated = Math.min(lastUpdated, Date.now()); // Last updated time can't be in the future
                lastUpdated = Math.max(lastUpdated, Date.now() - cacheTime + 60000); // Wait at least 1 minute
                return data;
            })
            .catch((error: any) => {
                logger.error(error);
            });
    } 
    
    // Use cached data
    else
        return data;
}