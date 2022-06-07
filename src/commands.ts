import Command from "./types/Command"

// All Access Commands
import Help from "./commands/help"
import Leaderboards from "./commands/leaderboards"
import ListOnlinePlayers from "./commands/listonlineplayers"
import Players from "./commands/players"
import Status from "./commands/status"
import Lookup from "./commands/lookup"
import ListBounties from './commands/listbounties'
import Info from './commands/info'

// Command Registry
const commands: Command[] = [
    // Non-Registered User Commands
    Help,
    Lookup,
    ListOnlinePlayers,
    Leaderboards,
    Players,
    ListBounties,
    Info,
    Status
];

export default commands;
