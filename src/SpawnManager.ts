/**
 * @Author Sugaku, math0898
 */
/**
 * Import the room prototype so we can look at some information provided by it.
 */
import { RoomPrototype } from "Room";
/**
 * One spawn manager per colony and it handles the spawning of the colony's
 * creeps.
 */
export class SpawnManager {
  /**
   * The stack which contains all the CreepSpawn objects.
   */
  private stack:CreepSpawn[] = [];
  /**
   * We need the room prototype to get to the room and access information there.
   */
  private roomPrototype:RoomPrototype;
  /**
   * Constructs a spawnManager object which has a refrence to the home room
   * containing the spawns it will need in the future.
   * @param r The RoomPrototype object the SpawnManager "occupies."
   */
  constructor(r:RoomPrototype) {
    this.roomPrototype = r;
  }
  /**
   * Returns the stack of CreepSpawns
   */
  getCreepSpawns() { return this.stack; }
  /**
   * Returns the roomPrototype attached
   */
  getRoomPrototype() { return this.roomPrototype; }
  /**
   * Adds a CreepSpawn to the stack if any only if it does not already
   * contain a creep of that role.
   * @param r The role string for the new CreepSpawn.
   * @param c The capacity for the new CreepSpawn.
   * @return 0 - All good.
   * @return -1 - Stack already contains a creep of given role.
   */
  add(r:string | undefined, c:number) {
    if (this.contains(r)) return -1;
    this.stack.push(new CreepSpawn(r, c));
    return 0;
  }
  /**
   * Attempts to spawn as many creeps as possible in the stack.
   * @return -1 - No creeps in the stack.
   * @return -2 - CreepSpawn has undefined parts.
   */
  spawn() {
    if (this.stack.length == 0) return -1;
    this.roomPrototype.updateSpawns();
    const s:StructureSpawn[] = this.roomPrototype.getSpawns();
    for (var i = 0; i < s.length; i++) {
      if (s[i].spawning == null) {
        const c:CreepSpawn = this.stack.pop()!;
        if (c.getBody() == undefined || c.getName() == undefined) return -2;
        if (s[i].spawnCreep(c.getBody()!, c.getName()!, {memory: {room: this.roomPrototype.getRoomRefrence(), role: c.getRole()}}) != OK) this.stack.push(c);
      }
    }
    return 0;
  }
  /**
   * Checks if the stack has a creep matching the request or add CreepSpawn.
   * @param r The role string to be looking out for.
   * @return false - The stack does not contain a creep matching the given role.
   * @return true - The stack does contain a creep matching the given role.
   */
   private contains(r:string | undefined) {
     for (var i = 0; i < this.stack.length; i++) if (this.stack[i].getRole() == r) return true;
     return false;
   }
   /**
    * Checks census numbers of creeps and makes a choice if more need to be
    * spawned or not.
    * @return 0 - All good.
    */
   check() {
     const room:Room = Game.rooms[this.roomPrototype.getRoomRefrence()];
     const counts:IDictionary = room.memory.counts;
     const capacity:number = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTENSION}).length * 50 + 300;

     var tw:number = 10;
     if (room.memory.energyStatus != undefined) tw = room.memory.energyStatus;

     var te:number = 0;
     if (room.find(FIND_MINERALS)[0].mineralAmount > 0) te = 1;

     var total:number = 0;

     for (let c in counts) {
       switch(c){
         case "Worker": if (counts[c] < tw && counts[c] != 0) this.add(undefined, capacity); break;
         case "Extractor": if (counts[c] < te) this.add("Extractor", capacity); break;
       }
       total += counts[c];
     }

     if (total == 0) this.add(undefined, 300);

     return 0;
   }
}
/**
 * Specifications for the creep being spawned including its role, body, and name.
 */
class CreepSpawn {
  /**
   * The role of the prospective creep. If undefined worker class is assumed.
   */
  private role?:string;
  /**
   * The body of the prospective creep.
   */
  private body:BodyPartConstant[] = [];
  /**
   * The name of the prospective creep. Dependent on role.
   */
  private name?:string;
  /**
   * Makes a new creep of the given role and size.
   * @param r The role the creep will be assuming. Worker is assumed if
   * undefined.
   * @param c The amount of energy that can be spent on the creep.
   */
  constructor(r:string | undefined, c:number) {
    this.role = r;
    this.generateBody(c);
    this.generateName();
  }
  /**
   * Returns the role of the creep.
   */
  getRole() { return this.role; }
  /**
   * Returns the body of the creep.
   */
  getBody() {
    if (this.body.length == 0) return undefined;
    else return this.body;
  }
  /**
   * Returns the name of the creep.
   */
  getName() { return this.name; }
  /**
   * Determines which helper method should be called to build the body of the
   * creep depending on the role given.
   * @param c The amount of energy that can be spent on the creep.
   * @return 0 - All good.
   * @return -1 - Creep Role not found.
   */
  private generateBody(c:number) {
    switch(this.role){
      case undefined: return this.buildWorker(c);
      case "Extractor": return this.buildWorker(c); //todo: Implement a body setup for extractors
    }
    return -1;
  }
  /**
   * Assigns the given parts to the creep in the desired order.
   * @param m The number of move parts for the body.
   * @param w The number of work parts for the body.
   * @param ca The number of carry parts for the body.
   * @param a The number of attack parts for the body.
   * @param r The number of ranged attack parts for the body.
   * @param h The number of heal parts for the body.
   * @param t The number of tough parts for the body.
   * @param cl The number of claim parts for the body.
   * @return 0 - All good.
   */
  private assignBody(m:number, w:number, ca:number, a:number, r:number, h:number, t:number, cl:number) {
    for (var i = 0; i < t; i++) this.body.push(TOUGH);
    for (var i = 0; i < w; i++) this.body.push(WORK);
    for (var i = 0; i < ca; i++) this.body.push(CARRY);
    for (var i = 0; i < a; i++) this.body.push(ATTACK);
    for (var i = 0; i < r; i++) this.body.push(RANGED_ATTACK);
    for (var i = 0; i < m; i++) this.body.push(MOVE);
    for (var i = 0; i < cl; i++) this.body.push(CLAIM);
    for (var i = 0; i < h; i++) this.body.push(HEAL);
    return 0;
  }
  /**
   * Determines counts for each body part of a worker creep.
   * @param c The capacity of energy that can be spent on the creep.
   * @return 0 - All good.
   */
  private buildWorker(c:number) {
    if (c > 1250) c = 1250;
    var spent = 300;
    var m:number = 2;
    var w:number = 1;
    var ca:number = 2;

    while ((spent + 200) <= c && m < 5) { m++; w++; ca++; spent += 200; }
    if ((spent + 100) <= c) { w++; spent += 100}
    while (spent >= 1000 && (spent + 50) <= c) { ca++; spent += 50; }

    return this.assignBody(m, w, ca, 0, 0, 0, 0, 0);
  }
  /**
   * Generates the name for the creep.
   * @return 0 - All good.
   */
  private generateName() {
    if (this.role != undefined) this.name = this.role + ": " + Game.time;
    else this.name = "Worker: " + Game.time;
    return 0;
  }
}
