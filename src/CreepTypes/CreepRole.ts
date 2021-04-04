/**
 * This boolean tells whether creeps should report what they are doing or not.
 */
var debug:boolean = true;
/**
 * Should the debug messages be sent to everyone?
 */
var publicDebug:boolean = true;
/**
 * A breif enum describing the possible goals creeps can carry out for their
 * colony.
 */
export enum Goals {FILL = "Fill", FIX = "Fix", BUILD = "Build",
 UPGRADE = "Upgrade", REINFORCE = "Reinforce"}
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
   * getRole retruns the role stored in the role string of the object.
   * Runtime: O(1)
   */
  getRole(){
    //This aint rocket science, return the role
    return this.role; //O(1)
  }
  /**
   * The compareRoomPos() function takes two room positions and compares them.
   * It returns true if and only if they are equal. If either are undefined the
   * function returns false.
   * Runtime: O(c)
   * @param a - The first room to compare
   * @param b - The second room to compare
   */
  private static compareRoomPos(a?:RoomPosition, b?:RoomPosition){
    //Check if both parameters are defined
    if(a != undefined && b != undefined){
      //Check the x positions
      if(a.x != b.x) return false;
      //Check the y positions
      if(a.y != b.y) return false;
      //Check the room names
      if(a.roomName != b.roomName) return false;
      //Then the positions are equal
      return true;
    //One of the parameters is undefined, return false.
    } else return false;
  }
  /**
   * This is a small utility function which when called on a creep checks how
   * much longer they have to life. If it is equal to some threashold then the
   * count in the room memory for that creep is reduced.
   * Runtime: O(c)
   * @param creep - The creep's life to check
   */
   static checkLife(creep:Creep) {
     //Check how long the creep has to live and decrement if necessary
     if(creep.body.length * 3 == creep.ticksToLive) Game.rooms[creep.memory.room].memory.counts["Worker"]--;
   }
  /**
   * creepOptimizedMove optimizes the movement that creeps do. This is primarly
   * done but greatly reducing the number of times a creep recalcualtes its
   * pathing. It works well between rooms, judging from slack it works way
   * better than the default moveTo(pos) for multiple rooms. I don't know why
   * this is... it just happens to be. Should not be used for actions that
   * require very reponsive creep movement such as combat!
   * Runtime: O(c)
   * @param creep - The creep being moved
   * @param target - The target position you want the creep to reach.
   */
  static creepOptimizedMove(creep:Creep, target:RoomPosition){
    //If the creep is fatigued exit
    if (creep.fatigue > 0) return;
    //Check if there's a path for this position or if we've reached the end of one
    if (!(this.compareRoomPos(creep.memory.pathTarget, target)) || creep.memory.pathStep == creep.memory.path?.length) {
      //Generate a path and save it to memory
      creep.memory.path = creep.pos.findPathTo(target, {ignoreCreeps: false});
      //Update the target of the path saved in memory
      creep.memory.pathTarget = target;
      //Start our step counter from 0
      creep.memory.pathStep = 0;
    }
    //Read memory
    var step:number | undefined = creep.memory.pathStep;
    var path:PathStep[] | undefined = creep.memory.path;
    //Quickly make some basic checks that we can actually move
    if(path != undefined && step != undefined) {
      //Move the creep and increase the step
      creep.move(path[step].direction);
      creep.memory.pathStep!++;
    }
  }
  /**
   * The method creepFill makes the given creep fill nearby strucutres. The
   * strucuture it fills is determined by findClosestByPath.
   * Runtime: O(c)
   * Note: n comes from the use of the RoomPosition.find method.
   * @param creep The creep actions are taken on
   */
  static creepFill(creep:Creep){
    //Send a message saying we're filling if we are
    if (debug) creep.say('⚙ ⛴', publicDebug);
    //Check to see if we have a target defined
    if (creep.memory.emptyStructure == undefined){
      //Find the nearest strucutre without full energy
      var s = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0});
      //Set memory if s is not null
      if (s != null) creep.memory.emptyStructure = s.id;
    }
    //Make sure we have a target structure before going on
    if (creep.memory.emptyStructure != undefined) {
      //Read memory
      var x:StructureExtension | StructureSpawn | null = Game.getObjectById(creep.memory.emptyStructure);
      //Check if the structure exists
      if (x != null && x!.store.getFreeCapacity(RESOURCE_ENERGY) != 0) {
        //Check if we're near the structure and move to it if we aren't
        if (!(creep.pos.isNearTo(x))) this.creepOptimizedMove(creep, x.pos);
        //Transfer the resource
        else creep.transfer(x, RESOURCE_ENERGY);
        //If the structure is null reset the memory
    } else creep.memory.emptyStructure = undefined;
    //Looks like stuff is good
    return 0;
    }
  //Something went wrong
  return -1;
  }
  /**
   * This method makes the creep pick up nearby dropped resources. As a method
   * of resource collection it works faster than mining and helps to reduce lost
   * resources to decay.
   * Runtime: O(c)
   * Note: It is unknown how many calculations RoomPosition.findPathTo() is
   * making so its denoted as 'c'.
   * @param creep The creep which is picking up resources
   * @param filter The resource the creep is picking up. Defaults to energy
   */
  static creepPickup(creep:Creep, filter:string = RESOURCE_ENERGY){
    //Say we're picking stuff up
    if(debug) creep.say('♻', publicDebug);
    //Check if dropped is undefined
    if (creep.memory.droppedResource == undefined) {
      //Find nearby dropped resources of type filter
      var d:Resource | null = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: {resourceType: filter}});
      //Set dropped resoucres if d is not null
      if (d != null) creep.memory.droppedResource = d.id;
    }
    //Make sure dropped is defined before moving on
    if (creep.memory.droppedResource != undefined) { //O(3) -> O(7 + n)
      //Read memory
      var d:Resource | null = Game.getObjectById(creep.memory.droppedResource);
      //Check if the resource exists
      if (d != null) {
        //Check if we're near the resource and move to it if we aren't
        if (!(creep.pos.isNearTo(d))) this.creepOptimizedMove(creep, d.pos);
        //Pickup the resource
        else creep.pickup(d);
      } else {
        //We didn't get anything back from the Game.getObjectById so reset the id
        creep.memory.droppedResource = undefined;
      }
    }
  }
  /**
   * creepHarvest navigates the creep to the nearest source and makes it mine
   * it. If the creep does nothing during this method a couple of different
   * return options are available.
   * Runtime: O(c)
   * @param creep The creep to be doing the harvesting
   * @return 0 Harvesting completed successfully
   * @return -1 A game object could not be found
   * @return -2 The creep has no sources string in memory and we couldn't assign
   * one.
   */
  static creepHarvest(creep:Creep){
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
  static run(creep:Creep){
    //If goal in creep memory was undefined we can upgrade for now
    if (creep.memory.goal == undefined) creep.memory.goal = Goals.UPGRADE;
    //Check if we're full on energy
    if (creep.carry.energy == creep.carryCapacity) creep.memory.working = true;
    //If we're out of energy obtain more
    else if (creep.carry.energy == 0 || creep.memory.working == undefined) creep.memory.working = false;
    //Lets Spend some energy
    if(creep.memory.working) {
      //Switch through possible goals and our actions based on them
      switch(creep.memory.goal) {
        //If goal is undefined... it shouldn't be make a confused face and hope math fixes it
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
      }
    }
    //Lets get some energy
    else {
      //We're mining
      if(debug) creep.say('⛏', true);
      //Got harvest
      if(Creep_Prototype.creepHarvest(creep) != 0) Creep_Prototype.creepPickup(creep);
    }
  }
}

/**
 * This interface extends the CreepRole class requiring a few things from the
 * roles ensuring functionality.
 */
export interface Creep_Role extends Creep_Prototype {
  //Real methods
  run(creep:Creep):void
}
