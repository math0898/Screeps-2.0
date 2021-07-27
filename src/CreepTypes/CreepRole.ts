/**
 * A breif enum describing the possible goals creeps can carry out for their
 * colony.
 */
export enum Goals {FILL = "FILL", FIX = "FIX", BUILD = "BUILD",
 UPGRADE = "UPGRADE", REINFORCE = "REINFORCE", STORE = "STORE",
 TRADE = "TRADE"}
/**
 * This boolean tells whether creeps should report what they are doing or not.
 */
export const debug:boolean = true;
/**
 * Should the debug messages be sent to everyone?
 */
export const publicDebug:boolean = true;
 /**
  * The compareRoomPos() function takes two room positions and compares them.
  * It returns true if and only if they are equal. If either are undefined the
  * function returns false.
  * @param a - The first room to compare
  * @param b - The second room to compare
  */
function compareRoomPos(a:RoomPosition | undefined, b:RoomPosition | undefined){
  if(a != undefined && b != undefined) {
    if(a.x != b.x) return false;
    if(a.y != b.y) return false;
    if(a.roomName != b.roomName) return false;
    return true;
  } else return false;
}
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
Creep.prototype.smartMove = function(t:RoomPosition){

  if (this.fatigue > 0) return -11; //Creep is fatigued

  const step:number | undefined = this.memory.pathStep;
  const path:PathStep[] | undefined = this.memory.path;

  if (compareRoomPos(this.memory.pathTarget, t) || step == path?.length) {
    this.memory.path = this.pos.findPathTo(t, {ignoreCreeps: false});
    this.memory.pathTarget = t;
    this.memory.pathStep = 0;
    return 1; //Path found
  }

  if(path != undefined && step != undefined) {
    if (path[step] != undefined) {
      this.move(path[step].direction);
      this.memory.pathStep = step + 1;
      return 0; //Function completed as intended
    }
  }
  return -666; //Uh....
}
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
Creep.prototype.smartHarvest = function(){

    const sid:string | undefined = this.memory.source;

    if (sid == undefined) {
      const t:Source | null = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (t != null) this.memory.source = t.id;
      return 1; //No source target was found so one was found
    }

    const s:Source | null = Game.getObjectById(sid);

    if(s != null && s.energy != 0) {
      if (!(this.pos.isNearTo(s))) this.smartMove(s.pos);
      else this.harvest(s);
      return 0; //Function completed as intended

    } else {
      this.memory.source = undefined;
      return -1; //A game object of that id could not be found
    }
}
/**
 * This is an abstract class which holds of lot of useful utility functions for
 * creep roles in general. This class includes an optimized movement method, and
 * short hands for common tasks such as mining and filling containers. Creep
 * roles should all extend this class and implement the interface bellow in this
 * file.
 */
export abstract class Creep_Prototype {
  /**
   * This is the role string which holdes the name of the role being defined.
   * Since this is the abstract class it is empty, but all other classes which
   * extend this one should add an appropriate role string.
   */
  private role:string = "";
  /**
   * Constructs a Creep_Prototype object.
   */
  constructor(r:string) {
    this.role = r;
  }
  /**
   * getRole retruns the role stored in the role string of the object.
   */
  getRole() { return this.role; }
  /**
   * The compareRoomPos() function takes two room positions and compares them.
   * It returns true if and only if they are equal. If either are undefined the
   * function returns false.
   * @param a - The first room to compare
   * @param b - The second room to compare
   */
  private static compareRoomPos(a?:RoomPosition, b?:RoomPosition){
    if(a != undefined && b != undefined) {
      if(a.x != b.x) return false;
      if(a.y != b.y) return false;
      if(a.roomName != b.roomName) return false;
      return true;
    } else return false;
  }
  /**
   * This is a small utility function which when called on a creep checks how
   * much longer they have to life. If it is equal to some threashold then the
   * count in the room memory for that creep is reduced.
   * @param creep - The creep's life to check
   */
   static checkLife(creep:Creep) { if(creep.body.length * 3 == creep.ticksToLive) Game.rooms[creep.memory.room].memory.counts["Worker"]--; }
  /**
   * creepOptimizedMove optimizes the movement that creeps do. This is primarly
   * done but greatly reducing the number of times a creep recalcualtes its
   * pathing. It works well between rooms, judging from slack it works way
   * better than the default moveTo(pos) for multiple rooms. I don't know why
   * this is... it just happens to be. Should not be used for actions that
   * require very reponsive creep movement such as combat!
   * @param creep - The creep being moved
   * @param target - The target position you want the creep to reach.
   */
  static creepOptimizedMove(creep:Creep, target:RoomPosition){
    if (creep.fatigue > 0) return;

    if (!(this.compareRoomPos(creep.memory.pathTarget, target)) || creep.memory.pathStep == creep.memory.path?.length) {
      creep.memory.path = creep.pos.findPathTo(target, {ignoreCreeps: false});
      creep.memory.pathTarget = target;
      creep.memory.pathStep = 0;
    }

    var step:number | undefined = creep.memory.pathStep;
    var path:PathStep[] | undefined = creep.memory.path;

    if(path != undefined && step != undefined) {
      if (path[step] != undefined) {
        creep.move(path[step].direction);
        creep.memory.pathStep!++;
      }
    }
  }
  /**
   * The method creepFill makes the given creep fill nearby strucutres. The
   * strucuture it fills is determined by findClosestByPath.
   * @param creep The creep actions are taken on
   */
  static creepFill(creep:Creep){
    if (debug) creep.say('⚙ ⛴', publicDebug);

    if (creep.memory.emptyStructure == undefined){
      var s = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0});
      if (s != null) creep.memory.emptyStructure = s.id;
    }

    if (creep.memory.emptyStructure != undefined) {
      var x:StructureExtension | StructureSpawn | null = Game.getObjectById(creep.memory.emptyStructure);
      if (x != null && x!.store.getFreeCapacity(RESOURCE_ENERGY) != 0) {
        if (!(creep.pos.isNearTo(x))) this.creepOptimizedMove(creep, x.pos);
        else creep.transfer(x, RESOURCE_ENERGY);
      } else creep.memory.emptyStructure = undefined;
      return 0;
    }
    return -1;
  }
  /**
   * This method makes the creep pick up nearby dropped resources. As a method
   * of resource collection it works faster than mining and helps to reduce lost
   * resources to decay.
   * @param creep The creep which is picking up resources
   * @param filter The resource the creep is picking up. Defaults to energy
   */
  static creepPickup(creep:Creep, filter:string = RESOURCE_ENERGY) {
    if(debug) creep.say('♻', publicDebug);

    if (creep.memory.droppedResource == undefined) {
      var d:Resource | null = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: {resourceType: filter}});
      if (d != null) creep.memory.droppedResource = d.id;

      else {
        const t:Tombstone | null = creep.pos.findClosestByPath(FIND_TOMBSTONES);
        if (t != null) if (t.store.getUsedCapacity(RESOURCE_ENERGY) > 0) creep.memory.tombstone = t.id;
      }
    }

    if (creep.memory.droppedResource != undefined) {
      var d:Resource | null = Game.getObjectById(creep.memory.droppedResource);
      if (d != null) {
        if (!(creep.pos.isNearTo(d))) this.creepOptimizedMove(creep, d.pos);
        else creep.pickup(d);
      } else {
        creep.memory.droppedResource = undefined;
      }

    } else if (creep.memory.tombstone != undefined){
      var t:Tombstone | null = Game.getObjectById(creep.memory.tombstone);
      if (t != null) {
        if (!(creep.pos.isNearTo(t))) this.creepOptimizedMove(creep, t.pos);
        else creep.withdraw(t, RESOURCE_ENERGY);
      } else {
        creep.memory.tombstone = undefined;
      }
    }
  }
  /**
   * creepHarvest navigates the creep to the nearest source and makes it mine
   * it. If the creep does nothing during this method a couple of different
   * return options are available.
   * @param creep The creep to be doing the harvesting
   * @return 0 Harvesting completed successfully
   * @return -1 A game object could not be found
   * @return -2 The creep has no sources string in memory and we couldn't assign
   * one.
   */
  static creepHarvest(creep:Creep){
    //Check if the creep has any work parts
    for (var i = 0; i <= creep.body.length; i++) {
      if (i == creep.body.length) return -3;
      if(creep.body[i].type == WORK) break;
    }
    //Say we're harvesting
    if(debug) creep.say('⛏', publicDebug);
    //check if sources is undefined
    if (creep.memory.sources == undefined) {
      //Find the active sources
      var t = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      //Set sources if t is not null
      if (t != null) creep.memory.sources = t.id;
    }
    //Make sure source is defined before moving on
    if (creep.memory.sources != undefined) {
      //Read memory
      var s:Source | null = Game.getObjectById(creep.memory.sources);
      //Check if there exists a source
      if(s != null && s.energy != 0) {
        //Check if we're near the source and move to it if we aren't
        if (!(creep.pos.isNearTo(s))) this.creepOptimizedMove(creep, s.pos);
        //Harvest the source
        else creep.harvest(s);
        //Everything was successful
        return 0;
        //We couldn't find the right game object
      } else { creep.memory.sources = undefined; return -1; }
    }
    //The creep has no sources string in memory and we couldn't assign it one
    return -2;
  }
  /**
   * The creepUpgrade method makes the creep upgrade the controller of the room
   * they are in. This is a very short and well optimized method and even
   * handles cases where a room does not have a controller.
   * Runtime: O(c) ---> Runs in constant time.
   * @param creep The creep to upgrade the controller
   */
  static creepUpgrade(creep:Creep){
    //Say we're upgrading
    if(debug) creep.say('⚙ 🕹', publicDebug)
    //Read the room controller
    var r:StructureController  | undefined = creep.room.controller;
    //Make sure r is defined
    if(r != undefined){
      //Check if we're in range of the controller, and move towards if we're not
      if (!(creep.pos.inRangeTo(r, 3))) this.creepOptimizedMove(creep, r.pos);
      //Upgrade the controller
      else creep.upgradeController(r);
      return 0;
    }
    return -1;
  }
  /**
   * This method, creepBuild makes the creep build the nearest construction
   * site. What's special about this method is that there is not anything
   * special to note.
   * Runtime: O(n)
   * @param creep The creep to build the construction site
   */
  static creepBuild(creep:Creep) {
    //Say we're building
    if(debug) creep.say('⚙ ⚒', publicDebug)
    //check if building is undefined
    if (creep.memory.building == undefined) {
      //Find the nearest site
      var b:ConstructionSite | null = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES); //O(n)
      //Set building if b is not null
      if (b != null) creep.memory.building = b.id;
    }
    //Make sure building is defined before moving on
    if (creep.memory.building != undefined) {
      //Read memory
      var b:ConstructionSite | null = Game.getObjectById(creep.memory.building);
      //Check if there exists a building
      if(b != null) {
        //Check if we're near the source and move to it if we aren't
        if (!(creep.pos.inRangeTo(b, 3))) this.creepOptimizedMove(creep, b.pos);
        //Harvest the source
        else creep.build(b);
        //We need to find a new construction site
      } else creep.memory.building = undefined;
      //Looks like a success
      return 0;
    }
    //Something went wrong
    return -1;
  }
  /**
   * creepMelee makes the creep attack the given victim. It uses moveTo without
   * reusing paths because combat is a situation where creeps must be very
   * responsive.
   * Runtime: O(c) ---> Runs in constant time.
   * @param creep The creep to move and attack
   * @param victim The creep we're trying to kill
   */
  static creepMelee(creep:Creep, victim:Creep){
    //Say we're building
    if(debug) creep.say('⚔', publicDebug)
    //Move to the creep we're attacking, visualize the path and refresh often
    if(!(creep.pos.isNearTo(victim.pos))) creep.moveTo(victim.pos, {reusePath: 0, visualizePathStyle: {}});
    //Attack them! grr!
    else creep.attack(victim);
  }
  /**
   * This method makes the creep repair buildings which are low on health. This
   * method is surprisingly complicted and can likely be simplified a lot.
   * Runtime: O(c) ---> Runs in constant time.
   * @param creep The creep to repair the building
   */
  static creepRepair(creep:Creep){
    //Say we're building
    if(debug) creep.say('⚙ ⛓', publicDebug)
    //check if building is undefined
    if (creep.memory.repair == undefined) {
      //Find the nearest site
      var b:Structure | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (c) => c.hits < c.hitsMax && (c.structureType != STRUCTURE_WALL && c.structureType != STRUCTURE_RAMPART)}); //O(n)
      //Set building if b is not null
      if (b != null) creep.memory.repair = b.id;
    }
    //Make sure building is defined before moving on
    if (creep.memory.repair != undefined) {
      //Read memory
      var b:Structure | null = Game.getObjectById(creep.memory.repair);
      //Check if there exists a building
      if(b != null && b.hits < b.hitsMax) {
        //Check if we're near the source and move to it if we aren't
        if (!(creep.pos.inRangeTo(b, 3))) this.creepOptimizedMove(creep, b.pos);
        //Harvest the source
        else creep.repair(b);
      } else {
        //We need to find a new construction site
        creep.memory.repair = undefined;
      }
      return 0;
    }
    return -1;
  }
  static creepReinforce(creep:Creep){
    var threashold:number = 3;
    for (var i = 1; i <= creep.room.controller!.level; i++) threashold = threashold * 10;
    if(debug) creep.say('⚙ 🏛', publicDebug);
    if (creep.memory.reinforce == undefined){
      var w:Structure | null = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (c) => (c.structureType == STRUCTURE_RAMPART || c.structureType == STRUCTURE_WALL) && c.hits < (threashold/20)});
      if (w == null) w = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (c) => (c.structureType == STRUCTURE_RAMPART || c.structureType == STRUCTURE_WALL) && c.hits < threashold});
      if (w != null) creep.memory.reinforce = w.id;
    }
    if (creep.memory.reinforce != undefined) {
      var w:Structure | null = Game.getObjectById(creep.memory.reinforce);
      if(w != null && w.hits < threashold) {
        if (!(creep.pos.inRangeTo(w, 3))) this.creepOptimizedMove(creep, w.pos);
        else creep.repair(w);
      } else creep.memory.reinforce = undefined;
      return 0;
    }
    return -1;
  }
  static creepStore(creep:Creep) {
    if (debug) creep.say('⚙ 🛢', publicDebug);
    var s: ResourceConstant | undefined = undefined;
    for (var i = 0; i < RESOURCES_ALL.length; i++) if (creep.store.getUsedCapacity(RESOURCES_ALL[i]) > 0) {s = RESOURCES_ALL[i]; break;}
    if (creep.room.storage != undefined && s != undefined) if (creep.transfer(creep.room.storage, s) == ERR_NOT_IN_RANGE) this.creepOptimizedMove(creep, creep.room.storage.pos);
    return 0;
  }
  static trader(creep:Creep) {
    if (debug) creep.say('🏙', publicDebug);
    if (creep.memory.working) {
      for (var i = 0; i < RESOURCES_ALL.length; i++) {
        if (creep.store.getUsedCapacity(RESOURCES_ALL[i]) > 0) {
          if (creep.transfer(creep.room.terminal!, RESOURCES_ALL[i]) == ERR_NOT_IN_RANGE) creep.moveTo(creep.room.terminal!);
        }
      }
    } else {
      if (creep.room.terminal!.store.getUsedCapacity() <= 100000) {
        for (var i = 0; i < RESOURCES_ALL.length; i++) {
          if (creep.room.storage!.store.getUsedCapacity(RESOURCES_ALL[i]) > 1) {
            if (creep.withdraw(creep.room.storage!, RESOURCES_ALL[i], Math.min(creep.store.getFreeCapacity(), creep.room.storage!.store.getUsedCapacity(RESOURCES_ALL[i]) - 1)) == ERR_NOT_IN_RANGE) creep.moveTo(creep.room.storage!);
          }
        }
      } else return -1;
    }
    return 0;
  }
  static run(creep:Creep){
    if (creep.memory.goal == Goals.TRADE) Creep_Prototype.trader(creep);
    if (creep.memory.goal == undefined) creep.memory.goal = Goals.UPGRADE;
    if (creep.store.getFreeCapacity() == 0) creep.memory.working = true;
    else if (creep.store.getUsedCapacity() == 0 || creep.memory.working == undefined) creep.memory.working = false;
    if(creep.memory.working) {
      switch(creep.memory.goal) {
        case undefined: creep.say("⁉"); return;
        case Goals.BUILD:
          if (Creep_Prototype.creepBuild(creep) != 0) creep.memory.goal = undefined;
          break;
        case Goals.FILL:
          if (Creep_Prototype.creepFill(creep) != 0) creep.memory.goal = undefined;
          break;
        case Goals.FIX:
          if (Creep_Prototype.creepRepair(creep) != 0) creep.memory.goal = undefined;
          break;
        case Goals.REINFORCE:
          if (Creep_Prototype.creepReinforce(creep) != 0) creep.memory.goal = undefined;
          break;
        case Goals.UPGRADE:
          if (Creep_Prototype.creepUpgrade(creep) != 0) creep.memory.goal = undefined;
          break;
        case Goals.STORE:
          if (Creep_Prototype.creepStore(creep) != 0) creep.memory.goal = undefined;
          break;
      }
    }
    else {
      if (creep.room.memory.energyStatus == undefined || creep.room.memory.energyStatus < 1 || creep.memory.goal == Goals.STORE) {
        if (debug) creep.say('⛏', publicDebug);
        if (Creep_Prototype.creepHarvest(creep) != 0) Creep_Prototype.creepPickup(creep);
      }
      else {
        if (debug) creep.say('🗜', publicDebug);
        if (creep.withdraw(creep.room.storage!, RESOURCE_ENERGY, creep.store.getFreeCapacity()) == ERR_NOT_IN_RANGE) creep.moveTo(creep.room.storage!);
      }
    }
  }
}
/**
 * This interface extends the CreepRole class requiring a few things from the
 * roles ensuring functionality.
 */
export interface Creep_Role extends Creep_Prototype {
  run(creep:Creep):void
}
