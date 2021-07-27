/**
 * This file is the int main() of my screeps program. This should be a fairly empty
 * and instead the heavy lifting should be done by clases/objects defined outside
 * of here.
 */
//This class handles everything related to rooms and their general information.
import { RoomPrototype } from "Room";
import { Queue, priority } from "Queue";
import { StatsManager} from "Stats";
//Import the tasks
import { init_Rooms, print_Rooms, update_Rooms } from "Room";
import { print_Stats, collect_Stats} from "Stats";
import { run_CreepManager, CreepManager } from "CreepManager";
import { Colony, Run_Colony, Setup_Goals } from "Colony";
import { MarketManipulator } from "MarketManipulator";

//A queue object holding the items which have been queue'd to complete.
var queue: Queue = new Queue();
//A rooms object holding all the rooms.
var rooms: RoomPrototype[];
var statsManager = new StatsManager();
//A colony array holding all of the colonies
export var colonies: Colony[];

// @ts-ignore, javascript shenanigans, ignore it typescript
global.Stats = module.exports = StatsManager;
// @ts-ignore
global.Queue = module.exports = queue;
// @ts-ignore
global.Creeps = module.exports = CreepManager;
// @ts-ignore
global.Market = module.exports = MarketManipulator;

/**
 * This is the main loop for the program. Expect clean concise code, anything
 * else means I should really get to work.
 */
module.exports.loop = function() { //Keep this main line

  //Purge duplicate requests on ocasion
  Queue.purgeDuplicateRequests();

  //Proccess the requests from the last tick
  queue.proccessRequests();

  //Check if we have any colonies. If we don't make one.
  if (colonies == undefined) {
    colonies = [];
    for (let r in Game.rooms){
      colonies.push(new Colony(Game.rooms[r]));
    }
  }
  //Generate a pixel if we can.
  if(Game.cpu.bucket == 10000) if (Game.shard.name != "") Game.cpu.generatePixel();
  //Add running the colonies to the queue
  // for(var i = 0; i < colonies.length; i++) queue.queueAdd(new Setup_Goals(colonies[i]), priority.HIGH);
  for(var i = 0; i < colonies.length; i++) queue.queueAdd(new Run_Colony(colonies[i]), priority.HIGH);

  //Add items that should always be run... but only if they can be
  queue.queueAdd(new update_Rooms(rooms), priority.LOW);
  queue.queueAdd(new collect_Stats(), priority.LOW);
  queue.queueAdd(new run_CreepManager(), priority.HIGH);

  //Check if we need to init rooms again, if so do it at maximum priority
  if (rooms == undefined) rooms = (new init_Rooms(rooms).run());

  //Telemetry stuffs
  queue.runQueue();
}
