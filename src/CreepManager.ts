//Import the roles
import { Creep_Role, Creep_Prototype, Goals } from "CreepTypes/CreepRole";
import { Scout } from "CreepTypes/Scout";
import { Defender } from "CreepTypes/Defender";
import { Extractor } from "CreepTypes/Extractor";
import { Miner } from "CreepTypes/Miner";
//Array indexed by a string which corrosponds to creep role object
interface IDictionary { [index: string]: Creep_Role; }
var roles = {} as IDictionary;
roles["Scout"] = new Scout();
roles["Defender"] = new Defender();
roles["Extractor"] = new Extractor();
roles["Miner"] = new Miner();
/**
 * This is an class describing a job for creeps to take on.
 */
export class Job {
  goal:Goals;
  room:string;
  constructor(g:Goals, r:string){
    this.goal = g;
    this.room = r;
  }
  getGoal() { return this.goal; }
  getRoom() { return this.room; }
}
/**
 * This is the creep manager class. It is mostly static and handles the
 * management of creeps including their AI and memory.
 */
export class CreepManager {
  /**
   * An array of jobs which need to be assigned to creeps.
   */
  static jobs:Job[] = [];
  /**
   * An array which holds all the creeps.
   */
  static creeps:Creep[] = [];
  /**
   * Runs the creep manager on all the creeps in the game.
   */
  static run() {
    CreepManager.resetRoomCounts();
    CreepManager.creeps = [];

    for (let c in Game.creeps) {
      var creep:Creep = Game.creeps[c];
      CreepManager.creeps.push(creep);

      const role: string | undefined = creep.memory.role;
      const room: string = creep.memory.room;
      const goal: string | undefined = creep.memory.goal;

      if(!Game.creeps[c]) { delete Memory.creeps[c]; continue; }

      if (role != undefined) Memory.rooms[room].counts[role] += 1;
      else {
        Memory.rooms[room].counts["Worker"] += 1;
        if (goal != undefined) Memory.rooms[room].counts[goal] +1;
      }

      if (creep.spawning) continue;
      else if (role != undefined) roles[role].run(creep);
      else Creep_Prototype.run(creep)
      Creep_Prototype.checkLife(creep);

      if (CreepManager.jobs.length > 0 && role == undefined) {
        const jobRoom: string = CreepManager.jobs[0].getRoom();
        const job: string = CreepManager.jobs[0].getGoal();
        if (room == jobRoom && CreepManager.goalSwitch(goal, job, jobRoom)) {
            creep.memory.goal = job;
            CreepManager.jobs.pop();
        }
      }
    }
  }
  /**
   * Resets all the counts for all the rooms under vision.
   */
  private static resetRoomCounts() {
    for (let r in Game.rooms) {
      var room:Room = Game.rooms[r];

      room.memory.counts["Worker"] = 0;
      room.memory.counts["Extractor"] = 0;
      room.memory.counts["Miner"] = 0;

      for (let g in Goals) {
        room.memory.counts[g] = 0;
      }
    }
  }
  /**
   * Runs some logic to determine whether a goal should be switched for another.
   */
  private static goalSwitch(goal: string | undefined, job: string, room: string) {
    if (goal == undefined || goal == Goals.UPGRADE) return true;
    else if (job == Goals.FILL && Game.rooms[room].memory.counts[Goals.FILL] == 0) return true;
    else return false;
  }
  static declareJob(j:Job){ if(CreepManager.uniqueJob(j)) CreepManager.jobs.push(j); }
  /**
   * Looks at the jobs array and makes sure the given job is not part of it.
   */
  private static uniqueJob(j:Job) {
    var jobs = CreepManager.jobs;
    for (var i = 0; i < jobs.length; i++) if (jobs[i].getRoom() == j.getRoom() && jobs[i].getGoal() == j.getGoal()) return false;
    return true;
  }
  static printJobs(){
    for (var i = 0; i < CreepManager.jobs.length; i++) console.log(CreepManager.jobs[i].getRoom() + " - " + CreepManager.jobs[i].getGoal());
    return 0;
  }
  static resetJobs() {
    CreepManager.jobs = [];
    return 0;
  }
}
//Import the tasks interface
import { task, template } from "task";
/**
 * The run CreepManager task runs the logic for the CreepManager which requests
 * other tasks that need to be completed in the future.
 */
export class run_CreepManager extends template implements task {

  constructor(){super("Run Creep Manager");}
  //Real Methods
  run(){
    //Simple enough I'd say
    CreepManager.run();
  }
}
