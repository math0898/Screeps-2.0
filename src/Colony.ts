//Import tasks
import { task, template } from "task";
//Import rooms
import { RoomPrototype } from "Room";
//Import the spawn manager
import { SpawnManager } from "SpawnManager";
import { CreepManager, Job } from "CreepManager";
import { Queue } from "Queue";
import { VisualsManager } from "VisualsManager";
import { RoomPlanner } from "RoomPlanner";
import { Goals } from "CreepTypes/CreepRole";
interface IDictionary { [index: string]: number; }
var p = {} as IDictionary;
export enum EnergyStatus {EXTREME_DROUGHT = 1, HIGH_DROUGHT = 2, DROUGHT = 3,
MEDIUM_DROUGHT = 4, LIGHT_DROUGHT = 5, LIGHT_FLOOD = 6, MEDIUM_FLOOD = 7,
FLOOD = 8, HIGH_FLOOD = 9, EXTREME_FLOOD = 10}
/**
 * A colony is a small collection of rooms. Each colony has a number of creeps
 * it needs to spawn to be functional.
 */
export class Colony{
  era:number;
  home:Room;
  neighbors?:Room[];
  neighborsPrototype?:RoomPrototype[];
  homePrototype:RoomPrototype;
  spawnManager:SpawnManager;
  roomPlanner:RoomPlanner;
  energyStatus?:EnergyStatus;

  //Constructors
  constructor(r:Room){
    this.home = r;
    this.era = -1;
    this.homePrototype = new RoomPrototype(r.name);
    if(r.controller != undefined) if(r.controller.level <= 2) this.era = 0;
    this.spawnManager = new SpawnManager(this.homePrototype);
    this.home.memory.counts = p;
    this.roomPlanner = new RoomPlanner(this.home);
  }

  //Methods
  run(){
    this.home = Game.rooms[this.home.name];
    var h = this.home.find(FIND_HOSTILE_CREEPS);
    if (h != undefined && h.length > 0) {
      var t = this.home.find(FIND_MY_STRUCTURES, {filter: (f) => f.structureType == STRUCTURE_TOWER});
      for (var i = 0; i < t.length; i++){
        // This is legal because of the filter we used.
        // @ts-ignore
        var tower:StructureTower = t[i];
        tower.attack(h[0]);
      }
    }
    var c:ConstructionSite[] | null = this.home.find(FIND_CONSTRUCTION_SITES);
    if(this.roomPlanner.getConstruction() != undefined && c.length == 0) this.roomPlanner.getConstruction()!.pop()!.place();
    //Request a census every 100 ticks
    if(Game.time % 100 == 0) {
      Queue.request(new Check_Energy(this));
    }
    if (this.roomPlanner.getDistanceTransform() == undefined) Queue.request(new Calculate_DistanceTransform(this));
    // if (this.roomPlanner.getMinCut() == undefined) {
    //   var pos:RoomPosition[] = [];
    //   var t = this.home.find(FIND_MY_STRUCTURES);
    //   for (var i = 0; i < t.length; i ++) pos.push(t[i].pos);
    //   pos.push(this.home.controller!.pos);
    //   Queue.request(new Calculate_MinCut(this, pos));
    // }
    if (Game.flags["Flood"] != undefined) if (Game.flags["Flood"].room!.name == this.home.name) Queue.request(new Calculate_FloodFill(this));
    this.checkGoals();
    //Run the spawn manger.
    this.spawnManager.check();
    this.spawnManager.spawn();
    if (Game.flags["Visuals"] != undefined) new VisualsManager().run(this.home.name, this.roomPlanner.getDistanceTransform(), this.roomPlanner.getFloodFill());
  }
  /**
   * checkGoals checks the goals of the colony and updates it with new roles
   * which are currently needed.
   */
   checkGoals(){
     //Search for a set of objects
     var threashold:number = 3;
     for (var i = 1; i <= this.home.controller!.level; i++) threashold = threashold * 10;
     const w:Structure[] | null = this.home.find(FIND_STRUCTURES, {filter: (c) => (c.structureType == STRUCTURE_RAMPART || c.structureType == STRUCTURE_WALL) && c.hits < threashold});
     const r:Structure[] | null = this.home.find(FIND_STRUCTURES, {filter: (c) => c.hits < c.hitsMax && ( c.structureType != STRUCTURE_WALL && c.structureType != STRUCTURE_RAMPART)});
     const c:ConstructionSite[] | null = this.home.find(FIND_CONSTRUCTION_SITES);
     const d:Source[] | null = this.home.find(FIND_SOURCES_ACTIVE);
     const s:Structure[] | null = this.home.find(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0}); //O(7 + 3n)
     if (this.home.terminal != undefined && Game.time % 1500 == 0) if (this.home.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < 200000) CreepManager.declareJob(new Job(Goals.TRADE, this.home.name));
     const h:number = this.home.memory.counts["STORE"];
     //Check the goals that need to be taken
     if (w != null && w.length > 0 && Game.time % 500 == 0) CreepManager.declareJob(new Job(Goals.REINFORCE, this.home.name));
     if (r != null && r.length > 0 && Game.time % 500 == 0) CreepManager.declareJob(new Job(Goals.FIX, this.home.name));
     if (c != null && c.length > 0 && Game.time % 250 == 0) CreepManager.declareJob(new Job(Goals.BUILD, this.home.name));
     if (s != null && s.length > 0 && Game.time % 25 == 0) CreepManager.declareJob(new Job(Goals.FILL, this.home.name));
     // if (d != null && d.length > 0 && Game.time % 500 == 0) CreepManager.declareJob(new Job(Goals.STORE, this.home.name));
     if (h < 6 && Game.time % 25 == 0) CreepManager.declareJob(new Job(Goals.STORE, this.home.name));
    }
    checkEnergyStatus() {
      if (this.home.storage == undefined) this.energyStatus = undefined;
      else {
        const energy:number = this.home.storage.store.getUsedCapacity(RESOURCE_ENERGY);
        if (energy > 450000) this.energyStatus = EnergyStatus.EXTREME_FLOOD;
        else if (energy > 400000) this.energyStatus = EnergyStatus.HIGH_FLOOD;
        else if (energy > 350000) this.energyStatus = EnergyStatus.FLOOD;
        else if (energy > 300000) this.energyStatus = EnergyStatus.MEDIUM_FLOOD;
        else if (energy > 250000) this.energyStatus = EnergyStatus.LIGHT_FLOOD;
        else if (energy > 200000) this.energyStatus = EnergyStatus.LIGHT_DROUGHT;
        else if (energy > 150000) this.energyStatus = EnergyStatus.MEDIUM_DROUGHT;
        else if (energy > 100000) this.energyStatus = EnergyStatus.DROUGHT;
        else if (energy > 50000) this.energyStatus = EnergyStatus.HIGH_DROUGHT;
        else this.energyStatus = EnergyStatus.EXTREME_DROUGHT;
      }
      this.home.memory.energyStatus = this.energyStatus;
    }
}

export class Run_Colony extends template implements task {
  //Variables
  colony:Colony;

  //Constructor
  constructor(c:Colony){
    super("Run Colony");
    this.colony = c;
  }

  //Methods
  run(){
    this.colony.run();
  }
}

export class Setup_Goals extends template implements task {
  //Variables
  colony:Colony;

  //Constructor
  constructor(c:Colony){
    super("Setup Goals");
    this.colony = c;
  }

  //Methods
  run(){
    this.colony.checkGoals();
  }
}

export class Check_Energy extends template implements task {
  colony:Colony;

  constructor(c:Colony){
    super("Check Energy");
    this.colony = c;
  }

  run(){this.colony.checkEnergyStatus();}
}

export class Calculate_DistanceTransform extends template implements task {
  //Variables
  colony:Colony;

  //Constructor
  constructor(c:Colony){
    super("Calculate Distance-transform");
    this.colony = c;
  }

  //Methods
  run(){
    if (this.colony.roomPlanner.computeDistanceTransform() != 0) Queue.request(new Calculate_DistanceTransform(this.colony));
  }
}
/**
 * Describes a basic floodfill algorithm run request. The colony is required to
 * know what roomPlanner is being asked to compute the flood and the
 */
export class Calculate_FloodFill extends template implements task {
  colony:Colony;
  constructor(c:Colony){
    super("Calculate Flood Fill");
    this.colony = c;
  }
  run(){
    if (this.colony.roomPlanner.computeFloodfill() != 0) Queue.request(new Calculate_FloodFill(this.colony));
  }
}
// export class Calculate_MinCut extends template implements task {
//   //Variables
//   name:string = "Calculate Min Cut";
//   colony:Colony;
//   protect:RoomPosition[] | undefined;
//
//   //Constructor
//   constructor(c:Colony, p:RoomPosition[] | undefined) {
//     super();
//     this.colony = c;
//     this.protect = p;
//   }
//
//   //Methods
//   run() {
//     if (this.colony.roomPlanner.minCutManager(this.protect) != 0) Queue.request(new Calculate_MinCut(this.colony, undefined));
//   }
// }
