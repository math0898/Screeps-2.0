/**
 * This file is the int main() of my screeps program. This should be a fairly empty
 * and instead the heavy lifting should be done by clases/objects defined outside
 * of here.
 */
//I think this line is fundamental to the functionality of type script on screeps.
import { ErrorMapper } from "utils/ErrorMapper";
//This class handles everything related to rooms and their general information.
import { struc_Room } from "Room";
import { Queue, priority } from "Queue";
import { StatsManager} from "Stats";
//Import the tasks
import { init_Rooms, print_Rooms, update_Rooms } from "tasks/Room_Tasks";
import { print_Stats, collect_Stats} from "tasks/Stats_Tasks";
import { run_CreepManager, creepAI_CreepManager } from "CreepManager";
import { Colony, Run_Colony } from "Colony";

//A queue object holding the items which have been queue'd to complete.
var queue: Queue = new Queue();
//A rooms object holding all the rooms.
var rooms: struc_Room[];
//A stats object which handles the collection of stats
var statsManager: StatsManager = new StatsManager();
//A colony array holding all of the colonies
var colonies: Colony[];

/**
 * This is a helper method for main to determine when to run each queue level.
 */
function runQueueHelper(){
  //We always run the highest priority.
  queue.runQueue(priority.HIGH);
  //Check if we're further than 50% from our cap and run medium if we are
  if(Game.cpu.getUsed() < Game.cpu.limit * 0.50) queue.runQueue(priority.MEDIUM);
  //Check if we're further than 75% from our cap and run low if we are
  if(Game.cpu.getUsed() < Game.cpu.limit * 0.25) queue.runQueue(priority.LOW);
  //Check if we're further than 90% from our cap and run no priority
  if(Game.cpu.getUsed() < Game.cpu.limit * 0.10) queue.runQueue(priority.NONE);
}

/**
 * This is the main loop for the program. Expect clean concise code, anything
 * else means I should really get to work.
 */
export const loop = ErrorMapper.wrapLoop(() => { //Keep this main line
  //Check if we have any colonies. If we don't make one.
  if (colonies == undefined) {
    colonies = [];
    for (let r in Game.rooms){
      colonies.push(new Colony(Game.rooms[r]));
    }
  }

  //Add running the colonies to the queue
  for(var i = 0; i < colonies.length; i++) queue.queueAdd(new Run_Colony(colonies[i]), priority.HIGH);

  //Proccess the requests from the last tick
  queue.proccessRequests();

  //Generate a pixel if we can.
  // if(Game.cpu.bucket == 10000) Game.cpu.generatePixel(); //Game.cpu.generatePixel(); is not a command in private servers, uncomment when pushing to public
  //Things that should always be ran
  queue.queueAdd(new creepAI_CreepManager(), priority.HIGH);

  //Add items that should always be run... but only if they can be
  queue.queueAdd(new update_Rooms(rooms), priority.LOW);
  queue.queueAdd(new collect_Stats(), priority.LOW);
  queue.queueAdd(new run_CreepManager(), priority.LOW);

  //Check if we need to init rooms again, if so do it at maximum priority
  if (rooms == undefined) rooms = (new init_Rooms(rooms).run());

  //Telemetry stuffs
  queue.queueAdd(new print_Rooms(rooms));
  queue.queueAdd(new print_Stats());

  queue.printQueue();
  runQueueHelper();
});