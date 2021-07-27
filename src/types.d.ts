/**
 * This interface describes the memory being stored on individual creeps and
 * their typings.
 */
interface CreepMemory {
  sources?:string;
  source?:string;
  emptyStructure?:string;
  droppedResource?:string;
  building?:string;
  pathTarget?:RoomPosition;
  path?:PathStep[];
  pathStep?:number;
  target?:string;
  working?:boolean;
  build?:boolean;
  repair?:string;
  role?: string;
  reinforce?:string;
  room: string;
  goal?: string;
  mineral?: string;
  tombstone?:string;
  said?:number;
}
interface Creep {
  /**
   * An extension of the Creep prototype. This function is meant to replace
   * creep.moveTo(target); In general it is also more efficent than using
   * creep.moveTo(target);
   * @param t The target positon you wnt the creep to reach
   * @return 1 Path found
   * @return 0 Function completed as intended
   * @return -11 Creep is fatigued
   * @return -666 Uh...
   */
  smartMove(t:RoomPosition): number;
  /**
   * An extension of the Creep prototype. This function is meant to replace
   * creep.harvest(target); and some relevant proccesses usually required to use
   * the function. In general it is also more efficent than trying to use those
   * extra proccesses and creep.harvest(target); Creep.memory.source should be
   * defined as a game object id if a specific source is desired.
   * @return 1 No source target was found so one was found
   * @return 0 Function completed as intended
   * @return -1 A game object of that id could not be found
   */
  smartHarvest(): number;
}
/**
 * For the next two memory sections I need an array indexed by strings and this
 * is what defines that for me.
 */
interface IDictionary { [index: string]: number; }
/**
 * The general memory being used. This includes mainly things like runtime stats
 * and creep memory management.
 */
interface Memory {
  /**
   * The number of ticks data has been collected on.
   */
  dataCollected: number;
  /**
   * The average cpu usage of all tasks.
   */
  cpuAverage: number;
  /**
   * The peak cpu usage of all ticks.
   */
  cpuPeak: number;
  /**
   * The first tick which had data collected on.
   */
  startTick: number;
  /**
   * The last tick creep memory was cleaned.
   */
  lastCreepClean: number;
  /**
   * Are stats initalized yet or not?
   */
  statsInit: boolean;
  /**
   * An array indexed by strings which describes the cpu cost of each task on
   * every tick.
   */
  taskCpu: IDictionary;
  /**
   * An array indxed by strings which counts the number of times each task has
   * been run.
   */
  taskCount: IDictionary;
}

interface RoomMemory {
  counts:IDictionary;
  energyStatus?:number;
}
