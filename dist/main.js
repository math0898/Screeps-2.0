'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * This enum cotains a couple number threasholds which are used later in this
 * file and in main.ts to determine how urgent a task may be. High number means
 * more urgency.
 */
var priority;
(function (priority) {
    priority[priority["HIGH"] = 100] = "HIGH";
    priority[priority["MEDIUM"] = 50] = "MEDIUM";
    priority[priority["LOW"] = 25] = "LOW";
    priority[priority["NONE"] = 0] = "NONE";
})(priority || (priority = {}));
/**
 * The Request class defines what a request looks like when it's sent from
 * somewhere other than main.ts. With the exception of main.ts every added to
 * the queue will be a version of the Request class at some point.
 */
class Request {
    /**
     * This describes the basic construction of a priority. Similar to the Request
     * class its fairly basic and just requires the setting of local counterparts.
     * @param t The described in the request
     * @param p The prioirty the task should be run at
     */
    constructor(t, p) { this.task = t; this.prio = p; }
    /**
     * getTask() returns the task in the Request object.
     */
    getTask() { return this.task; }
    /**
     * The getPrio method returns the priority of the Request object.
     */
    getPrio() { return this.prio; }
}
/**
 * This class, Queue implements a queue object which contains a list of tasks
 * to be run in reverse order on the priority level. For example if you add a, b
 * and c at priority HIGH once the queue starts the HIGH prioity it will resolve
 * in, c -> b -> a, assuming there's sufficent cpu remaining.
 */
class Queue {
    constructor() {
        /**
         * highTasks contains an array of tasks objects which are assumed to have a
         * priority of HIGH. Tasks with a HIGH priority are run without consideration
         * for cpu usage.
         */
        this.highTasks = [];
        /**
         * The mediumTasks array contains an array of tasks objects which are assumed
         * to have a priority of MEDIUM. Tasks are often run quickly with some
         * consideration for CPU usage.
         */
        this.mediumTasks = [];
        /**
         * This variable, lowTasks contains an array of task objects which are assumed
         * to have a priority of LOW. These tasks are run when they do not pose much
         * risk to going over on CPU.
         */
        this.lowTasks = [];
        /**
         * tasks contains an array of tasks objects which are assumed to have no
         * priority. A few examples of tasks which may end up here include various
         * screen drawing functions and console logging. Tasks at this level do not
         * run if they have the potential to go over on CPU.
         */
        this.tasks = [];
    }
    /**
     * The printQueue method prints all the items in the queue to the console in a
     * hopefully human readable format.
     */
    printQueue() {
        console.log("---- Queue: ----");
        console.log(priority.HIGH + ": ");
        for (var j = 0; j < this.highTasks.length; j++)
            console.log("    " + this.highTasks[j].getName());
        console.log(priority.MEDIUM + ": ");
        for (var j = 0; j < this.mediumTasks.length; j++)
            console.log("    " + this.mediumTasks[j].getName());
        console.log(priority.LOW + ": ");
        for (var j = 0; j < this.lowTasks.length; j++)
            console.log("    " + this.lowTasks[j].getName());
        console.log(priority.NONE + ": ");
        for (var j = 0; j < this.tasks.length; j++)
            console.log("    " + this.tasks[j].getName());
    }
    /**
     * This method runQueue runs the queue object with all of the given tasks. It
     * checks cpu before every task is run if it has reached a total cpu usage of
     * 50% before then but skips the check if bellow. Without considering that the
     * runtime of this method can vary wildly in runtime depending on the tasks
     * that are in the queue. As such I have opted not to give this method a
     * formal runtime analysis and most optimizations should be done in the tasks
     * themselves or in the free reign threashold which is currently 50%.
     */
    runQueue() {
        var _a, _b, _c, _d, _e, _f, _g;
        //Run all of the high tasks regardless of cpu
        while (this.highTasks.length > 0)
            (_a = this.highTasks.pop()) === null || _a === void 0 ? void 0 : _a.run();
        //Run all of the medium tasks if we're bellow 50% usage
        if (Game.cpu.getUsed() < Game.cpu.limit * 0.5)
            while (this.mediumTasks.length > 0)
                (_b = this.mediumTasks.pop()) === null || _b === void 0 ? void 0 : _b.run();
        //Run medium tasks until within 98% if we're above 50% usage
        else
            while (this.mediumTasks.length > 0 && Game.cpu.getUsed() < Game.cpu.limit * 0.98)
                (_c = this.mediumTasks.pop()) === null || _c === void 0 ? void 0 : _c.run();
        //Run all of the low tasks if we're bellow 50% usage
        if (Game.cpu.getUsed() < Game.cpu.limit * 0.5)
            while (this.lowTasks.length > 0)
                (_d = this.lowTasks.pop()) === null || _d === void 0 ? void 0 : _d.run();
        //Run low tasks until within 95% if we're above 50% usage
        else
            while (this.lowTasks.length > 0 && Game.cpu.getUsed() < Game.cpu.limit * 0.95)
                (_e = this.lowTasks.pop()) === null || _e === void 0 ? void 0 : _e.run();
        //Run all no prioirty tasks if we're bellow 50% usage
        if (Game.cpu.getUsed() < Game.cpu.limit * 0.5)
            while (this.tasks.length > 0)
                (_f = this.tasks.pop()) === null || _f === void 0 ? void 0 : _f.run();
        //Run no priority tasks until we're within 10% of cap
        else
            while (this.tasks.length > 0 && Game.cpu.getUsed() < Game.cpu.limit * 0.90)
                (_g = this.tasks.pop()) === null || _g === void 0 ? void 0 : _g.run();
    }
    /**
     * queueAdd adds an item to the queue immediatly, defaulting to a priority of
     * zero, unless one is provided.
     * Runtime: O(3)
     * @param t The task to be added to the queue
     * @param p the priority for the item to be added, defaults to no priority
     */
    queueAdd(t, p = priority.NONE) {
        //Check the priority this should be added at
        switch (p) { //O(1)
            //We're adding the item to the highTasks
            case priority.HIGH:
                this.highTasks.push(t);
                break; //O(3)
            //We're adding the item to the mediumTasks
            case priority.MEDIUM:
                this.mediumTasks.push(t);
                break; //O(3)
            //We're adding the item to the lowTasks
            case priority.LOW:
                this.lowTasks.push(t);
                break; //O(3)
            //We're adding the item to the tasks
            case priority.NONE:
                this.tasks.push(t);
                break; //O(3)
        }
    }
    /**
     * The request method works as a way for tasks to request other tasks to be
     * completed. Requests must be proccessed to a Queue object before they can
     * run.
     * Runtime: O(4)
     * @param t The task to be added to the requests array
     * @param p The priority for the request to be added, defaults to no priority
     */
    static request(t, p = priority.NONE) {
        //Make a quick request then push it to the array
        var request = new Request(t, p); //O(3)
        //Add it to the array to be proccessed later
        Queue.requests.push(request); //O(4)
    }
    /**
     * Proccesses all the requests that are in the requests array held on the
     * Queue static item. The object proccessRequests is called on will hold the
     * requests in its Queue.
     * Runtime: O(2 + 6n) where n is the length of the requests array
     */
    proccessRequests() {
        //Iterate through the requests and add them to the queue
        for (var i = 0; i < Queue.requests.length; i++)
            this.queueAdd(Queue.requests[i].getTask(), Queue.requests[i].getPrio()); //O(1 + 6n)
        //Clear the requests array
        Queue.requests = []; //O(2 + 6n)
    }
    /**
     * prugeDuplicateRequests removes all requests which are duplicates. This
     * prevents certain algorithms from running multiple times per tick such as
     * distanceTransform.
     * Runtime: O(2n) where n is the length of the requests array
     */
    static purgeDuplicateRequests() {
        //An array of request names
        var have = [];
        //A temporary array to store requests once they've been confirmed unique
        var temp = [];
        //Iterate through the requests and check if they've been in the array
        for (var i = 0; i < Queue.requests.length; i++) {
            //Check if its in the array
            if (have.indexOf(Queue.requests[i].getTask().getName()) > -1)
                continue;
            //If its not in the array add it
            have.push(Queue.requests[i].getTask().getName());
            //Add it to the temp array
            temp.push(Queue.requests[i]);
        }
        //Update the requests array with the purged copy
        Queue.requests = temp;
    }
}
/**
 * By default requests are empty but requests can be added by other tasks and
 * classes which need something to be done. requests are static and not bound
 * to any particular Queue object but are removed once they've entered a
 * specific queue.
 */
Queue.requests = [];

/**
 * A simple class which implements getName() so I don't have to a hundred times
 * over lol xD
 */
class template {
    //Constructor
    /**
     * Implementations of task should call this constructor with their name so it
     * can be private and not changed in the future.
     */
    constructor(n) {
        //Variables
        /**
         * A string varaible which stores the shorthand name for the task.
         */
        this.name = "Undefined";
        this.name = n;
    }
    //Accessor methods
    /**
     * Returns the name of the task
     */
    getName() { return this.name; }
}

/**
 * This file handles the definitions for the statsmamanger class. The stats class
 * handles tracking, logging, and printing of script preformence.
 */
class StatsManager {
    //Constructor
    /**
     * Runs setup for the StatsManager so it can run without issue.
     * Runtime: O(c) ---> Runs in constant time.
     */
    constructor() {
        //Initalize if we haven't
        if (StatsManager.getInitStatus() == false)
            StatsManager.init();
    }
    //Accessor methods
    static getInitStatus() {
        //Check the memory locations that need to be set if any are undefined we need to init
        //Check if we think we're initalized
        if (Memory.statsInit != true)
            return false;
        //Check the running average of cpu
        else if (Memory.cpuAverage == undefined)
            return false;
        //We must be all good then
        else
            return true;
    }
    //Real methods
    /**
     * This function initalizes the memory to take in stats.
     */
    static init() {
        //Set up the number of ticks we've collected data
        Memory.dataCollected = 0;
        //Set up the average cpu so far
        Memory.cpuAverage = 0;
        //Set up the peak cpu recorded
        Memory.cpuPeak = 0;
        //Set the fact we're initalized
        Memory.statsInit = true;
        //Set the tick we've started on
        Memory.startTick = Game.time;
        //Success
        return 0;
    }
    /**
     * Prints the stats collected, these are stored in Memory.stats.
     * Runtime: O(c) ---> Runs in constant time.
     */
    static print() {
        //Print a nice header
        console.log("---- Preformence Report ----");
        //The tick we begun collecting data on
        console.log("Tick Started on: " + Memory.startTick);
        //The tick we're on
        console.log("Tick Ended on: " + Game.time);
        //Data capture rate
        console.log("Data Captured on: " + (Memory.dataCollected - 1) + " / " + (Game.time - Memory.startTick) + " for a rate of " + Math.fround((Memory.dataCollected - 1) / (Game.time - Memory.startTick) * 100) + "%");
        //Print the average cpu used
        console.log("Average CPU Usage: " + Memory.cpuAverage);
        //Print the peak cpu used
        console.log("Peak CPU Usage: " + Memory.cpuPeak);
        //Report everything was successful
        return 0;
    }
    /**
     * Collects all the stats for cpu this tick.
     * Runtime: O(c) ---> Runs in constant time.
     */
    static collectCpu() {
        //Temp
        var cpuUsed = Game.cpu.getUsed();
        //Read memory
        var count = Memory.dataCollected;
        var average = Memory.cpuAverage;
        var peak = Memory.cpuPeak;
        //Do the maths for the new average
        var newAverage = ((average * count) + cpuUsed) / (count + 1);
        //Set the new peak if current tick is higher
        if (peak < cpuUsed)
            Memory.cpuPeak = cpuUsed;
        //Write to memory and increment our count
        Memory.cpuAverage = newAverage;
    }
    /**
     * Collects the stats for the StatsManager.
     */
    static collectStats() {
        //Collect Cpu data.
        this.collectCpu();
        //Increment the fact we collected data
        Memory.dataCollected++;
    }
}
/**
 * The collect_Stats task collects all the stats for the given tick.
 * Runtime: O(c) ---> Runs in constant time
 */
class collect_Stats extends template {
    //Constructors
    constructor() { super("Collect Stats"); }
    //Real methods
    run() {
        //Collect the stats... its really just that easy.
        StatsManager.collectStats();
    }
}

/**
 * This file contains the definitions for the Room class which defines a room,
 * whether hostile or not and assigns it certain properties.
 * @Author Sugaku, math0898
 */
/**
 * This enum holds definitions for the states that a room can be in.
 */
var state;
(function (state) {
    state["ALLIED"] = "allied";
    state["CONTROLLED"] = "controlled";
    state["HOSTILE"] = "hostile";
    state["EXPAND"] = "expand";
    state["MINE"] = "mine";
    state["UNKOWN"] = "unkown";
})(state || (state = {}));
/**
 * The room class. Handles information about rooms.
 */
class RoomPrototype {
    //Constructors
    /**
     * Constructs a room when given a hash for Game.rooms.
     * Runtime: O(f) ---> find command used.
     */
    constructor(name) {
        var _a, _b;
        //Refrence which points to the room in the future
        this.roomRefrence = name;
        //The current state of the room.
        this.roomState = this.findRoomState(); //O(f) ---> find command used.
        //Short hand the room name so we don't need to type that out all the time.
        const r = Game.rooms[name];
        //Check if the controlled is defined, if so set the level to it.
        if (r.controller != undefined)
            this.roomLevel = r.controller.level;
        //Otherwise set level to -1, there is no controller.
        else
            this.roomLevel = -1;
        //The owner of the room... is possible to be undefined in which case :shrug:
        this.roomOwner = (_b = (_a = r.controller) === null || _a === void 0 ? void 0 : _a.owner) === null || _b === void 0 ? void 0 : _b.username;
        //Set the spawn arrays
        this.roomSpawns = Game.rooms[this.roomRefrence].find(FIND_MY_SPAWNS);
        //Reset the total creep count for the room
        this.creepCount = 0;
        //Count the number of creeps which have this room as a refrence
        for (let c in Game.creeps) {
            //Check if their memory has a refrence to the room and increment if it does
            if (Game.creeps[c].memory.room == this.roomRefrence && Game.creeps[c] != undefined)
                this.creepCount++;
        }
    }
    //Acessor methods
    /**
     * Returns the refrence to the room.
     * Runtime: O(c) ---> Runs in constant time.
     */
    getRoomRefrence() { return this.roomRefrence; }
    /**
     * Returns the current state of the room.
     * Runtime: O(c) ---> Runs in constant time.
     */
    getRoomState() { return this.roomState; }
    /**
     * Returns the current level of the room.
     * Runtime: O(c) ---> Runs in constant time.
     */
    getRoomLevel() { return this.roomLevel; }
    /**
     * Returns the spawns.
     */
    getSpawns() { return this.roomSpawns; }
    /**
     * Prints the stats about the room in a nice human readable format.
     * Runtime: O(c) ---> Runs in constant time.
     */
    print() {
        //Print a nice header
        console.log("---- Room[" + this.roomRefrence + "] ----");
        //Print the current state of the room
        console.log("Room State: " + this.roomState);
        //Print the level of the room
        console.log("Room Level: " + this.roomLevel);
        //Print the owner of the room
        console.log("Room Owner: " + this.roomOwner);
        //Print the main spawn
        console.log("Main Room Spawn: " + this.roomSpawns[0].name);
    }
    //Real methods
    /**
     * Returns the state of the room after finding it.
     * Runtime: O(f) ---> find command used.
     * @param r The room which's type is being checked. Defaults to this object.
     */
    findRoomState(r = this) {
        //Make this const so we can call methods fewer times.
        const room = Game.rooms[r.getRoomRefrence()];
        //If the controller is not undefined...
        if (room.controller != undefined) {
            //Check if we own the controller, and return we control the room if we do.
            if (room.controller.my)
                return state.CONTROLLED;
            //If the room has a defined owner, and its not mine, its probably hostile.
            else if (room.controller.owner != undefined)
                return state.HOSTILE; //todo: More logic here for allies.
            //The room is unclaimed.
            else {
                //Scan for sources
                var s = room.find(FIND_SOURCES); //O(f) --> find command used.
                //If there's one source it could make a mine.
                if (s.length == 1)
                    return state.MINE;
                //If there's two sources it could make a good expansion.
                else if (s.length == 2)
                    return state.EXPAND;
            }
        }
        //The state of the room is unknown.
        return state.UNKOWN;
    }
    /**
     * Updates the room information.
     * Runtime: O(f) ---> find command used.
     */
    updateRoom() {
        var _a;
        //Find the current room state and update it.
        this.roomState = this.findRoomState(); //O(f) ---> find command used.
        //Check if a controller is defined
        if (Game.rooms[this.roomRefrence].controller != undefined) {
            //Update the room level to the controller level
            this.roomLevel = (_a = Game.rooms[this.roomRefrence].controller) === null || _a === void 0 ? void 0 : _a.level;
            this.updateSpawns();
        }
        //Reset the total creep count for the room
        this.creepCount = 0;
        //Count the number of creeps which have this room as a refrence
        for (let c in Game.creeps) {
            //Check if their memory has a refrence to the room and increment if it does
            if (Game.creeps[c].memory.room == this.roomRefrence)
                this.creepCount++;
        }
    }
    /**
     * Updates the spawns.
     */
    updateSpawns() {
        this.roomSpawns = [];
        this.roomSpawns = Game.rooms[this.roomRefrence].find(FIND_MY_SPAWNS);
        return 0;
    }
}
/**
 * The init_Rooms task which initializes all the rooms current visible in
 * Game.rooms. It is a fairly costly task and so shouldn't be run much.
 * Runtime: O(r * f) --> find is used at most once per room in Game.rooms
 */
class init_Rooms extends template {
    //Constructors
    /**
     * Takes the room array where the intialized rooms should be placed. WARN! This
     * will overwrite any data currently here!
     * @param rooms The room array to store the data in.
     */
    constructor(rooms) {
        //Call super
        super("Initalize Rooms");
        //Set localized counter part
        this.rooms = rooms;
    }
    //Real methods
    run() {
        //Reset rooms to a blank array
        this.rooms = [];
        //Setup a short hand for rooms
        for (let name in Game.rooms) {
            //Assign it because well this is kind of annoying
            var r = Game.rooms[name];
            //Now push the rooms into the array one by one
            this.rooms.push(new RoomPrototype(r.name));
        }
        return this.rooms;
    }
}
/**
 * The update_Rooms task updates all the rooms currently initalized in the given
 * array at construction.
 * Runtime: O(r * f) --> find is used at most once per room in Game.rooms
 */
class update_Rooms extends template {
    //Constructors
    /**
     * Makes an update_Rooms task.
     * @param rooms The room array to be updated.
     */
    constructor(rooms) {
        //Call super
        super("Update Rooms");
        //Set localized counter part
        this.rooms = rooms;
    }
    //Real methods
    /**
     * Updates all the rooms in the current array. It does not add new rooms.
     * Runtime: O(r * f) ---> Uses the find command for each room.
     */
    run() {
        //Check if rooms is undefined
        if (this.rooms == undefined) {
            console.log("Could not update rooms");
            return;
        }
        //Iterate down the array and call update room.
        for (var i = 0; i < this.rooms.length; i++)
            this.rooms[i].updateRoom(); //O(r * f)
    }
}

/**
 * A breif enum describing the possible goals creeps can carry out for their
 * colony.
 */
var Goals;
(function (Goals) {
    Goals["FILL"] = "FILL";
    Goals["FIX"] = "FIX";
    Goals["BUILD"] = "BUILD";
    Goals["UPGRADE"] = "UPGRADE";
    Goals["REINFORCE"] = "REINFORCE";
    Goals["STORE"] = "STORE";
    Goals["TRADE"] = "TRADE";
})(Goals || (Goals = {}));
/**
 * Should the debug messages be sent to everyone?
 */
const publicDebug = true;
/**
 * The compareRoomPos() function takes two room positions and compares them.
 * It returns true if and only if they are equal. If either are undefined the
 * function returns false.
 * @param a - The first room to compare
 * @param b - The second room to compare
 */
function compareRoomPos(a, b) {
    if (a != undefined && b != undefined) {
        if (a.x != b.x)
            return false;
        if (a.y != b.y)
            return false;
        if (a.roomName != b.roomName)
            return false;
        return true;
    }
    else
        return false;
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
Creep.prototype.smartMove = function (t) {
    if (this.fatigue > 0)
        return -11; //Creep is fatigued
    const step = this.memory.pathStep;
    const path = this.memory.path;
    if (compareRoomPos(this.memory.pathTarget, t) || step == (path === null || path === void 0 ? void 0 : path.length)) {
        this.memory.path = this.pos.findPathTo(t, { ignoreCreeps: false });
        this.memory.pathTarget = t;
        this.memory.pathStep = 0;
        return 1; //Path found
    }
    if (path != undefined && step != undefined) {
        if (path[step] != undefined) {
            this.move(path[step].direction);
            this.memory.pathStep = step + 1;
            return 0; //Function completed as intended
        }
    }
    return -666; //Uh....
};
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
Creep.prototype.smartHarvest = function () {
    const sid = this.memory.source;
    if (sid == undefined) {
        const t = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        if (t != null)
            this.memory.source = t.id;
        return 1; //No source target was found so one was found
    }
    const s = Game.getObjectById(sid);
    if (s != null && s.energy != 0) {
        if (!(this.pos.isNearTo(s)))
            this.smartMove(s.pos);
        else
            this.harvest(s);
        return 0; //Function completed as intended
    }
    else {
        this.memory.source = undefined;
        return -1; //A game object of that id could not be found
    }
};
/**
 * This is an abstract class which holds of lot of useful utility functions for
 * creep roles in general. This class includes an optimized movement method, and
 * short hands for common tasks such as mining and filling containers. Creep
 * roles should all extend this class and implement the interface bellow in this
 * file.
 */
class Creep_Prototype {
    /**
     * Constructs a Creep_Prototype object.
     */
    constructor(r) {
        /**
         * This is the role string which holdes the name of the role being defined.
         * Since this is the abstract class it is empty, but all other classes which
         * extend this one should add an appropriate role string.
         */
        this.role = "";
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
    static compareRoomPos(a, b) {
        if (a != undefined && b != undefined) {
            if (a.x != b.x)
                return false;
            if (a.y != b.y)
                return false;
            if (a.roomName != b.roomName)
                return false;
            return true;
        }
        else
            return false;
    }
    /**
     * This is a small utility function which when called on a creep checks how
     * much longer they have to life. If it is equal to some threashold then the
     * count in the room memory for that creep is reduced.
     * @param creep - The creep's life to check
     */
    static checkLife(creep) { if (creep.body.length * 3 == creep.ticksToLive)
        Game.rooms[creep.memory.room].memory.counts["Worker"]--; }
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
    static creepOptimizedMove(creep, target) {
        var _a;
        if (creep.fatigue > 0)
            return;
        if (!(this.compareRoomPos(creep.memory.pathTarget, target)) || creep.memory.pathStep == ((_a = creep.memory.path) === null || _a === void 0 ? void 0 : _a.length)) {
            creep.memory.path = creep.pos.findPathTo(target, { ignoreCreeps: false });
            creep.memory.pathTarget = target;
            creep.memory.pathStep = 0;
        }
        var step = creep.memory.pathStep;
        var path = creep.memory.path;
        if (path != undefined && step != undefined) {
            if (path[step] != undefined) {
                creep.move(path[step].direction);
                creep.memory.pathStep++;
            }
        }
    }
    /**
     * The method creepFill makes the given creep fill nearby strucutres. The
     * strucuture it fills is determined by findClosestByPath.
     * @param creep The creep actions are taken on
     */
    static creepFill(creep) {
        creep.say('⚙ ⛴', publicDebug);
        if (creep.memory.emptyStructure == undefined) {
            var s = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (s) => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0 });
            if (s != null)
                creep.memory.emptyStructure = s.id;
        }
        if (creep.memory.emptyStructure != undefined) {
            var x = Game.getObjectById(creep.memory.emptyStructure);
            if (x != null && x.store.getFreeCapacity(RESOURCE_ENERGY) != 0) {
                if (!(creep.pos.isNearTo(x)))
                    this.creepOptimizedMove(creep, x.pos);
                else
                    creep.transfer(x, RESOURCE_ENERGY);
            }
            else
                creep.memory.emptyStructure = undefined;
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
    static creepPickup(creep, filter = RESOURCE_ENERGY) {
        creep.say('♻', publicDebug);
        if (creep.memory.droppedResource == undefined) {
            var d = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, { filter: { resourceType: filter } });
            if (d != null)
                creep.memory.droppedResource = d.id;
            else {
                const t = creep.pos.findClosestByPath(FIND_TOMBSTONES);
                if (t != null)
                    if (t.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
                        creep.memory.tombstone = t.id;
            }
        }
        if (creep.memory.droppedResource != undefined) {
            var d = Game.getObjectById(creep.memory.droppedResource);
            if (d != null) {
                if (!(creep.pos.isNearTo(d)))
                    this.creepOptimizedMove(creep, d.pos);
                else
                    creep.pickup(d);
            }
            else {
                creep.memory.droppedResource = undefined;
            }
        }
        else if (creep.memory.tombstone != undefined) {
            var t = Game.getObjectById(creep.memory.tombstone);
            if (t != null) {
                if (!(creep.pos.isNearTo(t)))
                    this.creepOptimizedMove(creep, t.pos);
                else
                    creep.withdraw(t, RESOURCE_ENERGY);
            }
            else {
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
    static creepHarvest(creep) {
        //Check if the creep has any work parts
        for (var i = 0; i <= creep.body.length; i++) {
            if (i == creep.body.length)
                return -3;
            if (creep.body[i].type == WORK)
                break;
        }
        //Say we're harvesting
        creep.say('⛏', publicDebug);
        //check if sources is undefined
        if (creep.memory.sources == undefined) {
            //Find the active sources
            var t = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            //Set sources if t is not null
            if (t != null)
                creep.memory.sources = t.id;
        }
        //Make sure source is defined before moving on
        if (creep.memory.sources != undefined) {
            //Read memory
            var s = Game.getObjectById(creep.memory.sources);
            //Check if there exists a source
            if (s != null && s.energy != 0) {
                //Check if we're near the source and move to it if we aren't
                if (!(creep.pos.isNearTo(s)))
                    this.creepOptimizedMove(creep, s.pos);
                //Harvest the source
                else
                    creep.harvest(s);
                //Everything was successful
                return 0;
                //We couldn't find the right game object
            }
            else {
                creep.memory.sources = undefined;
                return -1;
            }
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
    static creepUpgrade(creep) {
        //Say we're upgrading
        creep.say('⚙ 🕹', publicDebug);
        //Read the room controller
        var r = creep.room.controller;
        //Make sure r is defined
        if (r != undefined) {
            //Check if we're in range of the controller, and move towards if we're not
            if (!(creep.pos.inRangeTo(r, 3)))
                this.creepOptimizedMove(creep, r.pos);
            //Upgrade the controller
            else
                creep.upgradeController(r);
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
    static creepBuild(creep) {
        //Say we're building
        creep.say('⚙ ⚒', publicDebug);
        //check if building is undefined
        if (creep.memory.building == undefined) {
            //Find the nearest site
            var b = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES); //O(n)
            //Set building if b is not null
            if (b != null)
                creep.memory.building = b.id;
        }
        //Make sure building is defined before moving on
        if (creep.memory.building != undefined) {
            //Read memory
            var b = Game.getObjectById(creep.memory.building);
            //Check if there exists a building
            if (b != null) {
                //Check if we're near the source and move to it if we aren't
                if (!(creep.pos.inRangeTo(b, 3)))
                    this.creepOptimizedMove(creep, b.pos);
                //Harvest the source
                else
                    creep.build(b);
                //We need to find a new construction site
            }
            else
                creep.memory.building = undefined;
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
    static creepMelee(creep, victim) {
        //Say we're building
        creep.say('⚔', publicDebug);
        //Move to the creep we're attacking, visualize the path and refresh often
        if (!(creep.pos.isNearTo(victim.pos)))
            creep.moveTo(victim.pos, { reusePath: 0, visualizePathStyle: {} });
        //Attack them! grr!
        else
            creep.attack(victim);
    }
    /**
     * This method makes the creep repair buildings which are low on health. This
     * method is surprisingly complicted and can likely be simplified a lot.
     * Runtime: O(c) ---> Runs in constant time.
     * @param creep The creep to repair the building
     */
    static creepRepair(creep) {
        //Say we're building
        creep.say('⚙ ⛓', publicDebug);
        //check if building is undefined
        if (creep.memory.repair == undefined) {
            //Find the nearest site
            var b = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (c) => c.hits < c.hitsMax && (c.structureType != STRUCTURE_WALL && c.structureType != STRUCTURE_RAMPART) }); //O(n)
            //Set building if b is not null
            if (b != null)
                creep.memory.repair = b.id;
        }
        //Make sure building is defined before moving on
        if (creep.memory.repair != undefined) {
            //Read memory
            var b = Game.getObjectById(creep.memory.repair);
            //Check if there exists a building
            if (b != null && b.hits < b.hitsMax) {
                //Check if we're near the source and move to it if we aren't
                if (!(creep.pos.inRangeTo(b, 3)))
                    this.creepOptimizedMove(creep, b.pos);
                //Harvest the source
                else
                    creep.repair(b);
            }
            else {
                //We need to find a new construction site
                creep.memory.repair = undefined;
            }
            return 0;
        }
        return -1;
    }
    static creepReinforce(creep) {
        var threashold = 3;
        for (var i = 1; i <= creep.room.controller.level; i++)
            threashold = threashold * 10;
        creep.say('⚙ 🏛', publicDebug);
        if (creep.memory.reinforce == undefined) {
            var w = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: (c) => (c.structureType == STRUCTURE_RAMPART || c.structureType == STRUCTURE_WALL) && c.hits < (threashold / 20) });
            if (w == null)
                w = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: (c) => (c.structureType == STRUCTURE_RAMPART || c.structureType == STRUCTURE_WALL) && c.hits < threashold });
            if (w != null)
                creep.memory.reinforce = w.id;
        }
        if (creep.memory.reinforce != undefined) {
            var w = Game.getObjectById(creep.memory.reinforce);
            if (w != null && w.hits < threashold) {
                if (!(creep.pos.inRangeTo(w, 3)))
                    this.creepOptimizedMove(creep, w.pos);
                else
                    creep.repair(w);
            }
            else
                creep.memory.reinforce = undefined;
            return 0;
        }
        return -1;
    }
    static creepStore(creep) {
        creep.say('⚙ 🛢', publicDebug);
        var s = undefined;
        for (var i = 0; i < RESOURCES_ALL.length; i++)
            if (creep.store.getUsedCapacity(RESOURCES_ALL[i]) > 0) {
                s = RESOURCES_ALL[i];
                break;
            }
        if (creep.room.storage != undefined && s != undefined)
            if (creep.transfer(creep.room.storage, s) == ERR_NOT_IN_RANGE)
                this.creepOptimizedMove(creep, creep.room.storage.pos);
        return 0;
    }
    static trader(creep) {
        creep.say('🏙', publicDebug);
        if (creep.memory.working) {
            for (var i = 0; i < RESOURCES_ALL.length; i++) {
                if (creep.store.getUsedCapacity(RESOURCES_ALL[i]) > 0) {
                    if (creep.transfer(creep.room.terminal, RESOURCES_ALL[i]) == ERR_NOT_IN_RANGE)
                        creep.moveTo(creep.room.terminal);
                }
            }
        }
        else {
            if (creep.room.terminal.store.getUsedCapacity() <= 100000) {
                for (var i = 0; i < RESOURCES_ALL.length; i++) {
                    if (creep.room.storage.store.getUsedCapacity(RESOURCES_ALL[i]) > 1) {
                        if (creep.withdraw(creep.room.storage, RESOURCES_ALL[i], Math.min(creep.store.getFreeCapacity(), creep.room.storage.store.getUsedCapacity(RESOURCES_ALL[i]) - 1)) == ERR_NOT_IN_RANGE)
                            creep.moveTo(creep.room.storage);
                    }
                }
            }
            else
                return -1;
        }
        return 0;
    }
    static run(creep) {
        if (creep.memory.goal == Goals.TRADE)
            Creep_Prototype.trader(creep);
        if (creep.memory.goal == undefined)
            creep.memory.goal = Goals.UPGRADE;
        if (creep.store.getFreeCapacity() == 0)
            creep.memory.working = true;
        else if (creep.store.getUsedCapacity() == 0 || creep.memory.working == undefined)
            creep.memory.working = false;
        if (creep.memory.working) {
            switch (creep.memory.goal) {
                case undefined:
                    creep.say("⁉");
                    return;
                case Goals.BUILD:
                    if (Creep_Prototype.creepBuild(creep) != 0)
                        creep.memory.goal = undefined;
                    break;
                case Goals.FILL:
                    if (Creep_Prototype.creepFill(creep) != 0)
                        creep.memory.goal = undefined;
                    break;
                case Goals.FIX:
                    if (Creep_Prototype.creepRepair(creep) != 0)
                        creep.memory.goal = undefined;
                    break;
                case Goals.REINFORCE:
                    if (Creep_Prototype.creepReinforce(creep) != 0)
                        creep.memory.goal = undefined;
                    break;
                case Goals.UPGRADE:
                    if (Creep_Prototype.creepUpgrade(creep) != 0)
                        creep.memory.goal = undefined;
                    break;
                case Goals.STORE:
                    if (Creep_Prototype.creepStore(creep) != 0)
                        creep.memory.goal = undefined;
                    break;
            }
        }
        else {
            if (creep.room.memory.energyStatus == undefined || creep.room.memory.energyStatus < 1 || creep.memory.goal == Goals.STORE) {
                creep.say('⛏', publicDebug);
                if (Creep_Prototype.creepHarvest(creep) != 0)
                    Creep_Prototype.creepPickup(creep);
            }
            else {
                creep.say('🗜', publicDebug);
                if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY, creep.store.getFreeCapacity()) == ERR_NOT_IN_RANGE)
                    creep.moveTo(creep.room.storage);
            }
        }
    }
}

//Import the creepRole interface
/**
 * This is the class for the JumpStart creep. The primary job of the JumpStart
 * creep is to push the RCL from 1 to 2 or to fill extensions in case the colony
 * dies It is mostly static as it simply needs to act on harvester creeps
 *instead of storing them in cache as an object.
 */
class Scout extends Creep_Prototype {
    constructor() { super("Scout"); }
    //Real Methods
    run(creep) {
        Scout.run(creep);
    }
    static run(creep) {
        //Scouts need to say things
        creep.say('🛰', true);
        //Scouts are simple... move to the scout target
        if (creep.memory.target != undefined)
            Creep_Prototype.creepOptimizedMove(creep, new RoomPosition(25, 25, creep.memory.target));
        //Else the mission is complete
        else
            creep.suicide();
    }
}

//Import the creepRole interface
/**
 * This is the class for the Carrier creep. The primary role of the carrier
 * creep is to move resources around the base and into storage or other devices
 * that could use them.
 */
class Defender extends Creep_Prototype {
    constructor() { super("Defender"); }
    //Real Methods
    run(creep) {
        Defender.run(creep);
    }
    static run(creep) {
        //Find hostile creeps
        var h = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        //Check if there are some
        if (h != undefined) {
            //Attack!!
            super.creepMelee(creep, h);
        }
        else {
            //No enemies
            creep.say('🛏︎', true);
        }
    }
}

//Import the creepRole interface
/**
 * This is the class for the Carrier creep. The primary role of the carrier
 * creep is to move resources around the base and into storage or other devices
 * that could use them.
 */
class Extractor extends Creep_Prototype {
    constructor() { super("Extractor"); }
    //Real Methods
    run(creep) {
        Extractor.run(creep);
    }
    static run(creep) {
        if (creep.memory.working == undefined)
            creep.memory.working = false;
        else if (creep.store.getFreeCapacity() == 0)
            creep.memory.working = true;
        else if (creep.store.getUsedCapacity() == 0)
            creep.memory.working = false;
        if (creep.memory.working) {
            creep.say("🛢", true);
            var s = undefined;
            for (var i = 0; i < RESOURCES_ALL.length; i++)
                if (creep.store.getUsedCapacity(RESOURCES_ALL[i]) > 0) {
                    s = RESOURCES_ALL[i];
                    break;
                }
            if (creep.room.storage != undefined && s != undefined)
                if (creep.transfer(creep.room.storage, s) == ERR_NOT_IN_RANGE)
                    this.creepOptimizedMove(creep, creep.room.storage.pos);
        }
        else {
            creep.say("🏗", true);
            // if (creep.memory.mineral = undefined) {
            //   var h = creep.pos.findClosestByPath(FIND_MINERALS);
            //   if (h != null) creep.memory.mineral = h.id;
            // }
            // if (creep.memory.mineral != undefined) {
            var m = creep.pos.findClosestByPath(FIND_MINERALS);
            if (m != null) {
                if (creep.harvest(m) == ERR_NOT_IN_RANGE)
                    creep.moveTo(m.pos);
                else if (creep.harvest(m) == ERR_NOT_FOUND)
                    creep.memory.role = undefined;
                else if (creep.harvest(m) == ERR_NOT_ENOUGH_RESOURCES)
                    creep.memory.working = true;
            }
            // else creep.memory.mineral = undefined;
            // }
        }
    }
}

/**
 * Import the creepRole interface, and some debugging variables.
 */
/**
 * A set of things the creep says and cycles through when mining.
 */
const mining = ["▪▪▪▪▪▪▪▪▪⛏", "▪▪▪▪▪▪▪▪⛏▪", "▪▪▪▪▪▪▪⛏▪▪", "▪▪▪▪▪▪⛏▪▪▪",
    "▪▪▪▪▪⛏▪▪▪▪", "▪▪▪▪⛏▪▪▪▪▪", "▪▪▪⛏▪▪▪▪▪▪", "▪▪⛏▪▪▪▪▪▪▪", "▪⛏▪▪▪▪▪▪▪▪",
    "⛏▪▪▪▪▪▪▪▪▪"];
/**
 * This is the class for the miner creep. The primary role of the miner creep
 * is to find an unworked source and to fully mine the source until the miner
 * creep dies.
 */
class Miner extends Creep_Prototype {
    /**
     * The constructor throws the role name up to the abstract class. Otherwise
     * we don't need anything else in particular for this role.
     */
    constructor() { super("Miner"); }
    /**
     * The object version of Miner.run(Creep). There is no difference here it just
     * might be easier to call this instead of the static method in some cases.
     */
    run(creep) { Miner.run(creep); }
    /**
     * The logic for the miner role. Mostly just finding a good source and then
     * telling the creep to smart harvest.
     */
    static run(creep) {
        const sid = creep.memory.source;
        if (sid == undefined) {
            creep.say('🤔', publicDebug);
            const s = creep.room.find(FIND_SOURCES_ACTIVE);
            if (s != undefined) {
                var t = s[0];
                for (var i = 1; i < s.length; i++)
                    if (s[i].energy > t.energy)
                        t = s[i];
                creep.memory.source = t.id;
            }
        }
        else {
            {
                var a = creep.memory.said;
                if (a == undefined)
                    a = 0;
                creep.say(mining[a], publicDebug);
                creep.memory.said = (a + 1) % mining.length;
            }
            creep.smartHarvest();
        }
    }
}

//Import the roles
var roles = {};
roles["Scout"] = new Scout();
roles["Defender"] = new Defender();
roles["Extractor"] = new Extractor();
roles["Miner"] = new Miner();
/**
 * This is an class describing a job for creeps to take on.
 */
class Job {
    constructor(g, r) {
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
class CreepManager {
    /**
     * Runs the creep manager on all the creeps in the game.
     */
    static run() {
        CreepManager.resetRoomCounts();
        CreepManager.creeps = [];
        for (let c in Game.creeps) {
            var creep = Game.creeps[c];
            CreepManager.creeps.push(creep);
            const role = creep.memory.role;
            const room = creep.memory.room;
            const goal = creep.memory.goal;
            if (!Game.creeps[c]) {
                delete Memory.creeps[c];
                continue;
            }
            if (role != undefined)
                Memory.rooms[room].counts[role] += 1;
            else {
                Memory.rooms[room].counts["Worker"] += 1;
                if (goal != undefined)
                    Memory.rooms[room].counts[goal] + 1;
            }
            if (creep.spawning)
                continue;
            else if (role != undefined)
                roles[role].run(creep);
            else
                Creep_Prototype.run(creep);
            Creep_Prototype.checkLife(creep);
            if (CreepManager.jobs.length > 0 && role == undefined) {
                const jobRoom = CreepManager.jobs[0].getRoom();
                const job = CreepManager.jobs[0].getGoal();
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
    static resetRoomCounts() {
        for (let r in Game.rooms) {
            var room = Game.rooms[r];
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
    static goalSwitch(goal, job, room) {
        if (goal == undefined || goal == Goals.UPGRADE)
            return true;
        else if (job == Goals.FILL && Game.rooms[room].memory.counts[Goals.FILL] == 0)
            return true;
        else
            return false;
    }
    static declareJob(j) { if (CreepManager.uniqueJob(j))
        CreepManager.jobs.push(j); }
    /**
     * Looks at the jobs array and makes sure the given job is not part of it.
     */
    static uniqueJob(j) {
        var jobs = CreepManager.jobs;
        for (var i = 0; i < jobs.length; i++)
            if (jobs[i].getRoom() == j.getRoom() && jobs[i].getGoal() == j.getGoal())
                return false;
        return true;
    }
    static printJobs() {
        for (var i = 0; i < CreepManager.jobs.length; i++)
            console.log(CreepManager.jobs[i].getRoom() + " - " + CreepManager.jobs[i].getGoal());
        return 0;
    }
    static resetJobs() {
        CreepManager.jobs = [];
        return 0;
    }
}
/**
 * An array of jobs which need to be assigned to creeps.
 */
CreepManager.jobs = [];
/**
 * An array which holds all the creeps.
 */
CreepManager.creeps = [];
/**
 * The run CreepManager task runs the logic for the CreepManager which requests
 * other tasks that need to be completed in the future.
 */
class run_CreepManager extends template {
    constructor() { super("Run Creep Manager"); }
    //Real Methods
    run() {
        //Simple enough I'd say
        CreepManager.run();
    }
}

/**
 * One spawn manager per colony and it handles the spawning of the colony's
 * creeps.
 */
class SpawnManager {
    /**
     * Constructs a spawnManager object which has a refrence to the home room
     * containing the spawns it will need in the future.
     * @param r The RoomPrototype object the SpawnManager "occupies."
     */
    constructor(r) {
        /**
         * The stack which contains all the CreepSpawn objects.
         */
        this.stack = [];
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
    add(r, c) {
        if (this.contains(r))
            return -1;
        this.stack.push(new CreepSpawn(r, c));
        return 0;
    }
    /**
     * Attempts to spawn as many creeps as possible in the stack.
     * @return -1 - No creeps in the stack.
     * @return -2 - CreepSpawn has undefined parts.
     */
    spawn() {
        if (this.stack.length == 0)
            return -1;
        this.roomPrototype.updateSpawns();
        const s = this.roomPrototype.getSpawns();
        for (var i = 0; i < s.length; i++) {
            if (s[i].spawning == null) {
                const c = this.stack.pop();
                if (c.getBody() == undefined || c.getName() == undefined)
                    return -2;
                if (s[i].spawnCreep(c.getBody(), c.getName(), { memory: { room: this.roomPrototype.getRoomRefrence(), role: c.getRole() } }) != OK)
                    this.stack.push(c);
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
    contains(r) {
        for (var i = 0; i < this.stack.length; i++)
            if (this.stack[i].getRole() == r)
                return true;
        return false;
    }
    /**
     * Checks census numbers of creeps and makes a choice if more need to be
     * spawned or not.
     * @return 0 - All good.
     */
    check() {
        const room = Game.rooms[this.roomPrototype.getRoomRefrence()];
        const counts = room.memory.counts;
        const capacity = room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_EXTENSION }).length * 50 + 300;
        var tw = 10;
        if (room.memory.energyStatus != undefined)
            tw = room.memory.energyStatus;
        var te = 0;
        if (room.find(FIND_MINERALS)[0].mineralAmount > 0)
            te = 1;
        var total = 0;
        for (let c in counts) {
            switch (c) {
                case "Worker":
                    if (counts[c] < tw && counts[c] != 0)
                        this.add(undefined, capacity);
                    break;
                case "Extractor":
                    if (counts[c] < te)
                        this.add("Extractor", capacity);
                    break;
            }
            total += counts[c];
        }
        if (total == 0)
            this.add(undefined, 300);
        return 0;
    }
}
/**
 * Specifications for the creep being spawned including its role, body, and name.
 */
class CreepSpawn {
    /**
     * Makes a new creep of the given role and size.
     * @param r The role the creep will be assuming. Worker is assumed if
     * undefined.
     * @param c The amount of energy that can be spent on the creep.
     */
    constructor(r, c) {
        /**
         * The body of the prospective creep.
         */
        this.body = [];
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
        if (this.body.length == 0)
            return undefined;
        else
            return this.body;
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
    generateBody(c) {
        switch (this.role) {
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
    assignBody(m, w, ca, a, r, h, t, cl) {
        for (var i = 0; i < t; i++)
            this.body.push(TOUGH);
        for (var i = 0; i < w; i++)
            this.body.push(WORK);
        for (var i = 0; i < ca; i++)
            this.body.push(CARRY);
        for (var i = 0; i < a; i++)
            this.body.push(ATTACK);
        for (var i = 0; i < r; i++)
            this.body.push(RANGED_ATTACK);
        for (var i = 0; i < m; i++)
            this.body.push(MOVE);
        for (var i = 0; i < cl; i++)
            this.body.push(CLAIM);
        for (var i = 0; i < h; i++)
            this.body.push(HEAL);
        return 0;
    }
    /**
     * Determines counts for each body part of a worker creep.
     * @param c The capacity of energy that can be spent on the creep.
     * @return 0 - All good.
     */
    buildWorker(c) {
        if (c > 1250)
            c = 1250;
        var spent = 300;
        var m = 2;
        var w = 1;
        var ca = 2;
        while ((spent + 200) <= c && m < 5) {
            m++;
            w++;
            ca++;
            spent += 200;
        }
        if ((spent + 100) <= c) {
            w++;
            spent += 100;
        }
        while (spent >= 1000 && (spent + 50) <= c) {
            ca++;
            spent += 50;
        }
        return this.assignBody(m, w, ca, 0, 0, 0, 0, 0);
    }
    /**
     * Generates the name for the creep.
     * @return 0 - All good.
     */
    generateName() {
        if (this.role != undefined)
            this.name = this.role + ": " + Game.time;
        else
            this.name = "Worker: " + Game.time;
        return 0;
    }
}

/**
 * The visuals manager draws the visual results of algorithms and other useful
 * information to the screen. What is drawn is determined by game flags.
 */
class VisualsManager {
    /**
     * run does some basic logic to determine what should be drawn to screen
     * before calling the helper methods to draw the information to the screen.
     * @param roomName - The room which is being drawn to
     * @param distanceTransform - The distance transform algorithm result
     * @param floodFill - The flood fill algorithm result
     */
    run(roomName, distanceTransform = undefined, floodFill = undefined) {
        if (Game.flags["DistanceTransform"] != undefined)
            this.distanceTransform(distanceTransform, roomName);
        else if (Game.flags["FloodFill"] != undefined)
            this.floodFill(floodFill, roomName);
    }
    /**
     * Draws the distance transform algorithm result to the given room.
     * @param distanceTransform - The distance transform algorithm result
     * @param roomName - The room the data is being drawn to
     */
    distanceTransform(distanceTransform, roomName) {
        if (distanceTransform != undefined)
            for (var i = 0; i < 50; i++)
                for (var j = 0; j < 50; j++) {
                    switch (distanceTransform[i][j]) {
                        case -1:
                            new RoomVisual(roomName).circle(j, i, { fill: "#607D8B", opacity: 80 });
                            break;
                        case 0: break;
                        case 1:
                            new RoomVisual(roomName).circle(j, i, { fill: "#B71C1C", opacity: 80 });
                            break;
                        case 2:
                            new RoomVisual(roomName).circle(j, i, { fill: "#880E4F", opacity: 80 });
                            break;
                        case 3:
                            new RoomVisual(roomName).circle(j, i, { fill: "#4A148C", opacity: 80 });
                            break;
                        case 4:
                            new RoomVisual(roomName).circle(j, i, { fill: "#311B92", opacity: 80 });
                            break;
                        case 5:
                            new RoomVisual(roomName).circle(j, i, { fill: "#0D47A1", opacity: 80 });
                            break;
                        case 6:
                            new RoomVisual(roomName).circle(j, i, { fill: "#01579B", opacity: 80 });
                            break;
                        case 7:
                            new RoomVisual(roomName).circle(j, i, { fill: "#006064", opacity: 80 });
                            break;
                        case 8:
                            new RoomVisual(roomName).circle(j, i, { fill: "#004D40", opacity: 80 });
                            break;
                        case 9:
                            new RoomVisual(roomName).circle(j, i, { fill: "#1B5E20", opacity: 80 });
                            break;
                        case 10:
                            new RoomVisual(roomName).circle(j, i, { fill: "#33691E", opacity: 80 });
                            break;
                        case 11:
                            new RoomVisual(roomName).circle(j, i, { fill: "#827717", opacity: 80 });
                            break;
                        case 12:
                            new RoomVisual(roomName).circle(j, i, { fill: "#F57F17", opacity: 80 });
                            break;
                        case 13:
                            new RoomVisual(roomName).circle(j, i, { fill: "#FF6F00", opacity: 80 });
                            break;
                        case 14:
                            new RoomVisual(roomName).circle(j, i, { fill: "#E65100", opacity: 80 });
                            break;
                        case 15:
                            new RoomVisual(roomName).circle(j, i, { fill: "#BF360C", opacity: 80 });
                            break;
                    }
                }
    }
    /**
     * Draws the flood fill algorithm result to the room given.
     * @param floodFill - The flood fill algorithm result
     * @param roomName - The room being drawn to
     */
    floodFill(floodFill, roomName) {
        if (floodFill != undefined)
            for (var i = 0; i < 50; i++)
                for (var j = 0; j < 50; j++) {
                    switch (floodFill[i][j]) {
                        case 0: break;
                        case -1:
                            new RoomVisual(roomName).circle(j, i, { fill: "#388E3C", opacity: 80 });
                            break;
                        case 1:
                            new RoomVisual(roomName).circle(j, i, { fill: "#303F9F", opacity: 80 });
                            break;
                    }
                }
    }
}

/**
 * An abstract class that defines a few useful functions for all algorithms in
 * general.
 */
class Algorithm {
    //Constructor
    /**
     * Constructs an algorithm with the given name.
     * Runtime: O(c) ---> Runs in constant time.
     */
    constructor(n) {
        //Variables
        /**
         * A string holding the name of the algorithm.
         */
        this.name = "";
        /**
         * A boolean holding the status of whether the algorithm is complete or not.
         */
        this.complete = false;
        this.name = n;
    }
    //Accessor Methods
    /**
     * isComplete returns whether or not the algorithm has completed its
     * calculations or not.
     * Runtime: O(c) ---> Runs in constant time.
     */
    isComplete() { return this.complete; }
    /**
     * This method simply returns the name of the algorithm in the form of a
     * string.
     * Runtime: O(c) ---> Runs in constant time.
     */
    getName() { return this.name; }
    /**
     * Reports the algorithm as complete. Should only be called by the manager.
     * Runtime: O(c) ---> Runs in constant time.
     */
    reportCompletion() { this.complete = true; }
}

/**
 * Import the algorithm abstract class because well... this is an algorithm is
 * it not?
 */
/**
 * The distance transform class handles the computations related to the distance
 * transform algorithm on a given room.
 */
class DistanceTransform extends Algorithm {
    /**
     * Construct a DistanceTransform object. For the most part it needs only to
     * know the room its running calculations on.
     * @param r - The room distance transform is being run on.
     */
    constructor(r) {
        //Make an appeal to a higher power with our name
        super("Distance Transform");
        /**
         * The matrix we're using to run the algorithm and report our findings.
         */
        this.distanceTransform = undefined;
        //Set our local room
        this.room = r;
    }
    /**
     * Return the matrix of the algorithm. Note that this may be incomplete and
     * isComplete() should be used before using it for any planning.
     */
    getResult() { return this.distanceTransform; }
    /**
     * The manager manages the distance transform algorithm and guides it through
     * all of its major steps. When making calls to this class only manager or the
     * above accessor methods should be touched or called. Doing anything else may
     * interfere with the algorithm.
     * @return - 2 Distance Transform matrix init'd.
     * @return - 1 We need an another call to make more calculations... progress
     * is being made.
     * @return - 0 The algorithm is done running and is complete. No more calls
     * needed.
     */
    manager() {
        //If our matrix isn't, set it up set it up and return the appropriate value
        if (this.distanceTransform == undefined) {
            this.setupDistanceTransformAlgorithm(1);
            return 2;
        }
        //Run the algorithm and return 1 if it needs to be run again
        else if (this.distanceTransformAlgorithmIterative())
            return 1;
        //The algorithm made no changes and so its complete
        else {
            //Report that we've completed calculations
            this.reportCompletion();
            //Return the appropriate value
            return 0;
        }
    }
    /**
     * setupDistanceTransformAlgorithm sets up this.distanceTransform in a way
     * that allows it to be used by the subsequent method
     * distanceTransformAlgorithm. We need positions that have not had their
     * distance calculated to be negative one and walls or boundaries to remain 0.
     * @param w The value of walkable spaces. When using the per cell algorithm w
     * should be -1 to tell it the cell needs checked. Using the iterative
     * implementation use 1 to indicate the cell's minimum possible distance from
     * the walls.
     */
    setupDistanceTransformAlgorithm(w = -1) {
        //Find the terrain of the room we're in.
        var terrain = this.room.getTerrain();
        //Init the matrix we're setting up
        this.distanceTransform = [];
        //Iterate through the y values
        for (var y = 0; y < 50; y++) {
            //Make a row to temporarily store values
            var row = [];
            //Iterate down the row
            for (var x = 0; x < 50; x++) {
                //If we're too close to the walls its a 0 for the sake of this algorithm even if its walkable
                if (x >= 48 || x <= 1 || y <= 1 || y >= 48)
                    row.push(0);
                //If the terrain is a wall add a 0 to the row array
                else if (terrain.get(x, y) == 1)
                    row.push(0);
                //If the terrain is walkable add a -1 to the row array
                else
                    row.push(w);
            }
            //Add the row to the matrix
            this.distanceTransform.push(row);
        }
    }
    /**
     * Calculates the distance for the first (-1) value it finds in the
     * distanceTransform array. This implementation has far fewer checks than the
     * iterative solution I've used in the past which would preform 8 * 625. This
     * one preforms (<=) 2 * 625 checks. Once for finding the cell and secondly to
     * calculate its distance.
     * @exception "Distance transform storage matrix is not defined."
     * @return true - Changes were made, follow up calls are required.
     * @return false - Changes were not made and follow up calls are not required.
     */
    distanceTransformAlgorithm() {
        //Check if distanceTransform is defined... it should be .-.
        if (this.distanceTransform == undefined)
            throw "Distance Transform storage matrix is not defined.";
        //Variable to determine if we're done or not
        var notDone = false;
        //Iterate through elements until one is -1
        for (var y = 0; y < 50; y++)
            for (var x = 0; x < 50; x++)
                if (this.distanceTransform[y][x] == -1) {
                    //We've found an item that needs calculated so we can say we're not done
                    notDone = true;
                    //The starting delta to check for any walls
                    var delta = 0;
                    //A boolean to determine exit
                    var exit = false;
                    //A nice infinite loop we'll break from in a bit once exit conditions are met
                    while (!exit) {
                        //Increase delta
                        delta++;
                        //Set our dx to delta
                        var dx = delta;
                        //Iterate through y's looking for a wall
                        for (var dy = -delta; dy <= delta; dy++)
                            if (this.distanceTransform[y + dy][x + dx] == 0)
                                exit = true;
                        //Same for negative dx
                        dx = -delta;
                        //Iterate through y's looking for a wall
                        for (var dy = -delta; dy <= delta; dy++)
                            if (this.distanceTransform[y + dy][x + dx] == 0)
                                exit = true;
                        //Set our dy to delta
                        var dy = delta;
                        //Iterate through x's looking for a wall
                        for (var dx = -delta; dx <= delta; dx++)
                            if (this.distanceTransform[y + dy][x + dx] == 0)
                                exit = true;
                        //Same for negative dy
                        dy = -delta;
                        //Iterate through x's looking for a wall
                        for (var dx = -delta; dx <= delta; dx++)
                            if (this.distanceTransform[y + dy][x + dx] == 0)
                                exit = true;
                    }
                    //Set our value to how far we got
                    this.distanceTransform[y][x] = delta;
                    //We don't want to calculate more than one per round since that can get expensive so we return what we got
                    return notDone;
                }
        //Return whether we are done or not
        return notDone;
    }
    /**
     * Calculate the distance transform for all positions iteratively. Overall
     * preforms 8 * 625 checks per rotation which is far more than the above's
     * max of 2 * 625 however this aglorithm only needs to be called n + 1 times
     * where n is the maximum distance any point has from a wall. The other needs
     * called once for every open space which I estimate to be roughly 500 spaces.
     * It works by checking if all of the neighbors of the cell are equal to it
     * and are not a wall. If they're not a wall and have the same distance value
     * as our current self we can assume our distance is at least theirs + 1.
     */
    distanceTransformAlgorithmIterative() {
        //Check that the distance transform is defined
        if (this.distanceTransform == undefined)
            throw "Distance Transform matrix is not defined.";
        //Temporary variable to store the matrix
        var temp = _.cloneDeep(this.distanceTransform);
        //Another temp variable to determine if any changes were made
        var change = false;
        //Iterate through all matrix positions
        for (var y = 0; y < 50; y++)
            for (var x = 0; x < 50; x++) {
                //Store the current cell we're looking at since there's going to be a lot of comparisons
                var current = this.distanceTransform[x][y];
                //If the current cell is a wall we can move on
                if (current == 0)
                    continue;
                //Check the neighbors and if any of them are lower than we are, we cannot
                // assume our distance is any higher than it is so we continue on
                if (this.distanceTransform[x][y - 1] < current)
                    continue;
                if (this.distanceTransform[x + 1][y - 1] < current)
                    continue;
                if (this.distanceTransform[x - 1][y - 1] < current)
                    continue;
                if (this.distanceTransform[x - 1][y] < current)
                    continue;
                if (this.distanceTransform[x + 1][y] < current)
                    continue;
                if (this.distanceTransform[x][y + 1] < current)
                    continue;
                if (this.distanceTransform[x + 1][y + 1] < current)
                    continue;
                if (this.distanceTransform[x - 1][y + 1] < current)
                    continue;
                //If all of our neighbors are lower than us we can make a change and report that
                change = true;
                //Increment the cell
                temp[x][y]++;
            }
        //Update the matrix with our calculations
        this.distanceTransform = temp;
        //Return whether or not a change was made to the matrix
        return change;
    }
}

/**
 * Import the algorithm abstract class because well... this is an algorithm is
 * it not?
 */
/**
 * The flood fill class handles the calculation of the flood fill algorithm. The
 * flood fill algorithm simulates a flood starting from a point marked by the flag
 * "Flood" and expands outwards only being stopped by natural walls, man made
 * walls and ramparts.
 */
class FloodFill extends Algorithm {
    /**
     * Construct a FloodFill object. For the most part is needs only to know the
     * room its running calculations on.
     * @param r - The room flood fill is being run on.
     */
    constructor(r) {
        //Make an appeal to a higher power with our name
        super("Flood Fill");
        /**
         * The matrix we're using to run the algorithm and report our findings.
         */
        this.floodFill = undefined;
        //Set our local room
        this.room = r;
    }
    /**
     * Return the matrix of the algorithm. Note that this may be incomplete and
     * isComplete() should be used before using it for any planning.
     */
    getResult() { return this.floodFill; }
    /**
     * The manager manages the flood fill algorithm and guides it through all of its
     * major steps. When making calls to this class only manager or the above
     * accessor methods should be touched or called. Doing anything else may
     * interfere with the algorithm.
     * @return - 2 Flood Fill matrix init'd.
     * @return - 1 We need an another call to make more calculations... progress
     * is being made.
     * @return - 0 The algorithm is done running and is complete. No more calls
     * needed.
     */
    manager() {
        //If our matrix isn't, set it up and return the appropriate value
        if (this.floodFill == undefined) {
            this.setupFloodFillAlgorithm();
            return 2;
        }
        //Run the algorithm and if a change is made return 1
        else if (this.floodFillAlgorithm())
            return 1;
        //If the algorithm was run and no changes were made we're complete
        else
            return 0;
    }
    /**
     * setupFloodFillAlgorithm sets up this.floodFill in a way that allows it to be
     * used by the subsequent method floodFillAlgorithm. We need non walls to be
     * one and walls to be 0.
     */
    setupFloodFillAlgorithm() {
        //Update the stale room game object
        this.room = Game.rooms[this.room.name];
        //Make a temp variable to store the terrain of the room
        var terrain = this.room.getTerrain();
        //Init the matrix so it can store values
        this.floodFill = [];
        //Iterate through the y values
        for (var y = 0; y < 50; y++) {
            //Make a row to temporarily store values
            var row = [];
            //Iterate down the row
            for (var x = 0; x < 50; x++) {
                //If the terrain is a wall add a 0 to the row array
                if (terrain.get(x, y) == 1)
                    row.push(0);
                //If the terrain is walkable add a 01 to the row array
                else
                    row.push(1);
            }
            //Add the row to the matrix
            this.floodFill.push(row);
        }
        //Add the first infected tile to the matrix
        this.floodFill[Game.flags["Flood"].pos.y][Game.flags["Flood"].pos.x] = -1;
    }
    /**
     * Infects tiles next to the infected tile if they should be infected. It
     * checks all neighbors of any -1 cells it finds which is always less than 625
     * so the estimate checks bounded above by 625 + 8 * 625 (The surface area of
     * the current infection).
     * @exception "Flood Fill storage matrix is not defined."
     * @return true - Changes were made, follow up calls are required.
     * @return false - Changes were not made and follow up calls are not required.
     */
    floodFillAlgorithm() {
        //Check if floodfill is defined... it should be .-.
        if (this.floodFill == undefined)
            throw "Flood Fill storage matrix is not defined.";
        //Make a temproary clone of the matrix
        var temp = _.cloneDeep(this.floodFill);
        //Make a temp variable to store whether we've made a change or not
        var change = false;
        //Iterate through the matrix and find an infected cell
        for (var y = 1; y < 49; y++)
            for (var x = 1; x < 49; x++)
                if (this.floodFill[y][x] == -1) {
                    //Check if the value of a cell is 1, if it is call some additional logic to determine whether it should
                    // be changed. We also set change = change || helper() so we can garuntee any changes made will result in
                    // change ending in a true value.
                    if (this.floodFill[y][x - 1] == 1)
                        change = this.floodFillHelper(y, x - 1, temp) || change;
                    if (this.floodFill[y + 1][x - 1] == 1)
                        change = this.floodFillHelper(y + 1, x - 1, temp) || change;
                    if (this.floodFill[y - 1][x - 1] == 1)
                        change = this.floodFillHelper(y - 1, x - 1, temp) || change;
                    if (this.floodFill[y - 1][x] == 1)
                        change = this.floodFillHelper(y - 1, x, temp) || change;
                    if (this.floodFill[y + 1][x] == 1)
                        change = this.floodFillHelper(y + 1, x, temp) || change;
                    if (this.floodFill[y][x + 1] == 1)
                        change = this.floodFillHelper(y, x + 1, temp) || change;
                    if (this.floodFill[y + 1][x + 1] == 1)
                        change = this.floodFillHelper(y + 1, x + 1, temp) || change;
                    if (this.floodFill[y - 1][x + 1] == 1)
                        change = this.floodFillHelper(y - 1, x + 1, temp) || change;
                }
        //Update the flood fill matrix
        this.floodFill = temp;
        //Return whether we made a change or not
        return change;
    }
    /**
     * Determines whether the given position should be infected and makes the
     * change should it be required.
     * @param y - The y position of the cell.
     * @param x - The x position of the cell.
     * @param temp - The matrix we're updating if it needs to be changed.
     * @return true - The change was made.
     * @return false - The change was not made.
     */
    floodFillHelper(y, x, temp) {
        //Look at the cell in the room
        var l = this.room.lookAt(x, y);
        //Make a temp boolean to determine if we're making the change
        var t = false;
        //Search through the items in l and set t to true if one of them satisfies the conditions
        for (let i in l)
            if (l[i].type == LOOK_STRUCTURES) {
                t = true;
                break;
            }
        //If t has been satisfied make the change
        if (!t)
            temp[y][x] = -1;
        //Return whether t has been satisifed
        return t;
    }
}

class ConstructionProject {
    constructor(p, t) {
        this.pos = p;
        this.type = t;
    }
    place() {
        Game.rooms[this.pos.roomName].createConstructionSite(this.pos, this.type);
    }
}
var patterns;
(function (patterns) {
    patterns["BUNKER"] = "bunker";
})(patterns || (patterns = {}));
/**
 * The room planner has a number of nice algorithms and methods defined to help
 * in the planning of rooms as a whole.
 */
class RoomPlanner {
    // private minCut:MinCut;
    constructor(r) {
        this.construction = undefined;
        this.planningComplete = false;
        this.room = r;
        this.distanceTransform = new DistanceTransform(r);
        this.floodFill = new FloodFill(r);
    }
    getDistanceTransform() { return this.distanceTransform.getResult(); }
    isDistanceTransformComplete() { return this.distanceTransform.isComplete(); }
    computeDistanceTransform() { return this.distanceTransform.manager(); }
    getFloodFill() { return this.floodFill.getResult(); }
    isFloodFillComplete() { return this.floodFill.isComplete(); }
    computeFloodfill() { return this.floodFill.manager(); }
    // getMinCut(){ return this.minCut.getResult(); }
    // isMinCutComplete() { return this.minCut.isComplete(); }
    // computeMinCut() { return this.mincut.manager(); }
    getConstruction() {
        if (this.room.controller.level < 2)
            return undefined;
        else if (!this.isDistanceTransformComplete())
            return undefined;
        else if (this.construction == undefined && this.room.controller.level == 2)
            this.constructionProjects2();
        return this.construction;
    }
    constructionProjects2() {
        //Roads
        // var s:Source[] = this.room.find(FIND_SOURCES);
        // var p:PathStep[];
        // for (var i = 0; i < s.length; i++) {
        //   p = this.room.findPath(this.room.controller!.pos, s[i].pos, {ignoreCreeps: true, ignoreRoads: true, swampCost: 2});
        //   for (var j = 1; j < p.length - 1; j++) this.construction.push(new ConstructionProject(new RoomPosition(p[j].x,p[j].y,this.room.name), STRUCTURE_ROAD));
        // }
        //Check if construction is defined... it should be
        if (this.construction == undefined)
            throw "Construction is not defined.";
        //If we're using the bunker pattern
        if (this.roomType == patterns.BUNKER) {
            //Throw an error if we don't have bunker center defined for some reason.
            if (this.bunkerCenter == undefined)
                throw "Bunker Center not defined.";
            //Five extensions and their locations
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 3, this.bunkerCenter.y + 2, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 4, this.bunkerCenter.y + 2, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 2, this.bunkerCenter.y + 3, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 3, this.bunkerCenter.y + 3, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 2, this.bunkerCenter.y + 4, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
        }
    }
    /**
     * constructionProjects3 adds projects with their appropriate location to the
     * construction array to be built in a room in the future. Buildings are added
     * with the assumption that anything requiring controller level 3 can be
     * built.
     * O(c) --> Runs in constant time.
     * @exception "Needed elements not defined."
     * @exception "Bunker Center not defined."
     */
    constructionProjects3() {
        //Check if construction is defined... it should be
        if (this.construction == undefined)
            throw "Construction is not defined.";
        //If we're using the bunker pattern
        if (this.roomType == patterns.BUNKER) {
            //Throw an error if we don't have bunker center defined for some reason.
            if (this.bunkerCenter == undefined)
                throw "Bunker Center not defined.";
            //One tower and its position
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 1, this.bunkerCenter.y - 1, this.bunkerCenter.roomName), STRUCTURE_TOWER));
            //Five extensions and their positions
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 2, this.bunkerCenter.y - 2, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 3, this.bunkerCenter.y - 2, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 4, this.bunkerCenter.y - 2, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 3, this.bunkerCenter.y - 1, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 3, this.bunkerCenter.y + 1, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
        }
    }
    /**
     * constructionProjects4 adds projects with their appropriate location to the
     * construction array to be built in a room in the future. Buildings are added
     * with the assumption that anything requiring controller level 4 can be
     * built.
     * O(c) --> Runs in constant time.
     * @exception "Needed elements not defined."
     * @exception "Bunker Center not defined."
     */
    constructionProjects4() {
        //Check if construction is defined... it should be
        if (this.construction == undefined)
            throw "Construction is not defined.";
        //If we're using the bunker pattern
        if (this.roomType == patterns.BUNKER) {
            //Throw an error if we don't have bunker center defined for some reason.
            if (this.bunkerCenter == undefined)
                throw "Bunker Center not defined.";
            //One storage and its position
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x, this.bunkerCenter.y + 4, this.bunkerCenter.roomName), STRUCTURE_STORAGE));
            //Ten extensions and their locations
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 2, this.bunkerCenter.y - 3, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 1, this.bunkerCenter.y - 3, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 3, this.bunkerCenter.y - 3, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 2, this.bunkerCenter.y - 2, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 3, this.bunkerCenter.y - 2, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 4, this.bunkerCenter.y - 2, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 3, this.bunkerCenter.y - 1, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 1, this.bunkerCenter.y - 3, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 2, this.bunkerCenter.y - 3, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 3, this.bunkerCenter.y - 3, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
        }
    }
    /**
     * constructionProjects5 adds projects with their appropriate location to the
     * construction array to be built in a room in the future. Buildings are added
     * with the assumption that anything requiring controller level 5 can be
     * built.
     * O(c) --> Runs in constant time.
     * @exception "Needed elements not defined."
     * @exception "Bunker Center not defined."
     */
    constructionProjects5() {
        //Check if construction is defined... it should be
        if (this.construction == undefined)
            throw "Construction is not defined.";
        //If we're using the bunker pattern
        if (this.roomType == patterns.BUNKER) {
            //Throw an error if we don't have bunker center defined for some reason.
            if (this.bunkerCenter == undefined)
                throw "Bunker Center not defined.";
            //One tower and its location
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 1, this.bunkerCenter.y - 1, this.bunkerCenter.roomName), STRUCTURE_TOWER));
            //Ten extensions and their positions
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 5, this.bunkerCenter.y + 1, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 5, this.bunkerCenter.y - 1, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 5, this.bunkerCenter.y + 5, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 5, this.bunkerCenter.y + 4, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 5, this.bunkerCenter.y + 3, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 4, this.bunkerCenter.y + 5, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 4, this.bunkerCenter.y + 4, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 3, this.bunkerCenter.y + 5, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 2, this.bunkerCenter.y - 4, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 2, this.bunkerCenter.y - 4, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
        }
    }
    /**
     * constructionProjects6 adds projects with their appropriate location to the
     * construction array to be built in a room in the future. Buildings are added
     * with the assumption that anything requiring controller level 6 can be
     * built.
     * O(c) --> Runs in constant time.
     * @exception "Needed elements not defined."
     * @exception "Bunker Center not defined."
     */
    constructionProjects6() {
        //Check if construction is defined... it should be
        if (this.construction == undefined)
            throw "Construction is not defined.";
        //If we're using the bunker pattern
        if (this.roomType == patterns.BUNKER) {
            //Throw an error if we don't have bunker center defined for some reason.
            if (this.bunkerCenter == undefined)
                throw "Bunker Center not defined.";
            //The terminal and its location
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 2, this.bunkerCenter.y + 2, this.bunkerCenter.roomName), STRUCTURE_TERMINAL));
            //Three labs and their positions
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 3, this.bunkerCenter.y + 2, this.bunkerCenter.roomName), STRUCTURE_LAB));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 3, this.bunkerCenter.y + 3, this.bunkerCenter.roomName), STRUCTURE_LAB));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 2, this.bunkerCenter.y + 3, this.bunkerCenter.roomName), STRUCTURE_LAB));
            //Ten extensions
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x, this.bunkerCenter.y - 5, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 1, this.bunkerCenter.y - 5, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 1, this.bunkerCenter.y - 5, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x, this.bunkerCenter.y - 4, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 5, this.bunkerCenter.y, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 5, this.bunkerCenter.y + 1, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 5, this.bunkerCenter.y - 1, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 4, this.bunkerCenter.y, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 5, this.bunkerCenter.y, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 4, this.bunkerCenter.y, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
        }
        //Place the extractor
        this.construction.push(new ConstructionProject(this.room.find(FIND_MINERALS)[0].pos, STRUCTURE_EXTRACTOR));
    }
    /**
     * constructionProjects7 adds projects with their appropriate location to the
     * construction array to be built in a room in the future. Buildings are added
     * with the assumption that anything requiring controller level 7 can be
     * built.
     * O(c) --> Runs in constant time.
     * @exception "Needed elements not defined."
     * @exception "Bunker Center not defined."
     */
    constructionProjects7() {
        //Check if construction is defined... it should be
        if (this.construction == undefined)
            throw "Construction is not defined.";
        //If we're using the bunker pattern
        if (this.roomType == patterns.BUNKER) {
            //Throw an error if we don't have bunker center defined for some reason.
            if (this.bunkerCenter == undefined)
                throw "Bunker Center not defined.";
            //Three labs and their positions
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 4, this.bunkerCenter.y + 4, this.bunkerCenter.roomName), STRUCTURE_LAB));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 4, this.bunkerCenter.y + 2, this.bunkerCenter.roomName), STRUCTURE_LAB));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 2, this.bunkerCenter.y + 4, this.bunkerCenter.roomName), STRUCTURE_LAB));
            //Two links and their positions // TODO: add the other two next to sources
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 3, this.bunkerCenter.y + 1, this.bunkerCenter.roomName), STRUCTURE_LINK));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 2, this.bunkerCenter.y + 2, this.bunkerCenter.roomName), STRUCTURE_LINK));
            //One tower and its position
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x, this.bunkerCenter.y - 1, this.bunkerCenter.roomName), STRUCTURE_TOWER));
            //Ten extensions and their positions
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 3, this.bunkerCenter.y - 5, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 2, this.bunkerCenter.y - 5, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 4, this.bunkerCenter.y - 4, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 3, this.bunkerCenter.y - 4, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 5, this.bunkerCenter.y - 3, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 3, this.bunkerCenter.y - 5, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 2, this.bunkerCenter.y - 5, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 4, this.bunkerCenter.y - 4, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 3, this.bunkerCenter.y - 4, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 5, this.bunkerCenter.y - 3, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            //The second spawn and its position
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 2, this.bunkerCenter.y, this.bunkerCenter.roomName), STRUCTURE_SPAWN));
        }
    }
    /**
     * constructionProjects8 adds projects with their appropriate location to the
     * construction array to be built in a room in the future. Buildings are added
     * with the assumption that anything requiring controller level 8 can be
     * built.
     * O(c) --> Runs in constant time.
     * @exception "Needed elements not defined."
     * @exception "Bunker Center not defined."
     */
    constructionProjects8() {
        if (this.construction == undefined)
            throw "Construction is not defined.";
        if (this.roomType == patterns.BUNKER) {
            if (this.bunkerCenter == undefined)
                throw "Bunker Center not defined.";
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x, this.bunkerCenter.y + 5, this.bunkerCenter.roomName), STRUCTURE_NUKER));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x, this.bunkerCenter.y + 2, this.bunkerCenter.roomName), STRUCTURE_POWER_SPAWN));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 5, this.bunkerCenter.y + 5, this.bunkerCenter.roomName), STRUCTURE_OBSERVER));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 3, this.bunkerCenter.y + 5, this.bunkerCenter.roomName), STRUCTURE_LAB));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 4, this.bunkerCenter.y + 5, this.bunkerCenter.roomName), STRUCTURE_LAB));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 5, this.bunkerCenter.y + 4, this.bunkerCenter.roomName), STRUCTURE_LAB));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 5, this.bunkerCenter.y + 3, this.bunkerCenter.roomName), STRUCTURE_LAB));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 1, this.bunkerCenter.y, this.bunkerCenter.roomName), STRUCTURE_TOWER));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 1, this.bunkerCenter.y, this.bunkerCenter.roomName), STRUCTURE_TOWER));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x, this.bunkerCenter.y + 1, this.bunkerCenter.roomName), STRUCTURE_TOWER));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 5, this.bunkerCenter.y - 5, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 5, this.bunkerCenter.y - 5, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 2, this.bunkerCenter.y - 6, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 2, this.bunkerCenter.y - 6, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 6, this.bunkerCenter.y - 2, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 6, this.bunkerCenter.y - 2, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 6, this.bunkerCenter.y + 2, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 6, this.bunkerCenter.y + 2, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 2, this.bunkerCenter.y + 6, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x - 2, this.bunkerCenter.y + 6, this.bunkerCenter.roomName), STRUCTURE_EXTENSION));
            this.construction.push(new ConstructionProject(new RoomPosition(this.bunkerCenter.x + 2, this.bunkerCenter.y, this.bunkerCenter.roomName), STRUCTURE_SPAWN));
        }
    }
}

//Import tasks
var p = {};
var EnergyStatus;
(function (EnergyStatus) {
    EnergyStatus[EnergyStatus["EXTREME_DROUGHT"] = 1] = "EXTREME_DROUGHT";
    EnergyStatus[EnergyStatus["HIGH_DROUGHT"] = 2] = "HIGH_DROUGHT";
    EnergyStatus[EnergyStatus["DROUGHT"] = 3] = "DROUGHT";
    EnergyStatus[EnergyStatus["MEDIUM_DROUGHT"] = 4] = "MEDIUM_DROUGHT";
    EnergyStatus[EnergyStatus["LIGHT_DROUGHT"] = 5] = "LIGHT_DROUGHT";
    EnergyStatus[EnergyStatus["LIGHT_FLOOD"] = 6] = "LIGHT_FLOOD";
    EnergyStatus[EnergyStatus["MEDIUM_FLOOD"] = 7] = "MEDIUM_FLOOD";
    EnergyStatus[EnergyStatus["FLOOD"] = 8] = "FLOOD";
    EnergyStatus[EnergyStatus["HIGH_FLOOD"] = 9] = "HIGH_FLOOD";
    EnergyStatus[EnergyStatus["EXTREME_FLOOD"] = 10] = "EXTREME_FLOOD";
})(EnergyStatus || (EnergyStatus = {}));
/**
 * A colony is a small collection of rooms. Each colony has a number of creeps
 * it needs to spawn to be functional.
 */
class Colony {
    //Constructors
    constructor(r) {
        this.home = r;
        this.era = -1;
        this.homePrototype = new RoomPrototype(r.name);
        if (r.controller != undefined)
            if (r.controller.level <= 2)
                this.era = 0;
        this.spawnManager = new SpawnManager(this.homePrototype);
        this.home.memory.counts = p;
        this.roomPlanner = new RoomPlanner(this.home);
    }
    //Methods
    run() {
        this.home = Game.rooms[this.home.name];
        var h = this.home.find(FIND_HOSTILE_CREEPS);
        if (h != undefined && h.length > 0) {
            var t = this.home.find(FIND_MY_STRUCTURES, { filter: (f) => f.structureType == STRUCTURE_TOWER });
            for (var i = 0; i < t.length; i++) {
                // This is legal because of the filter we used.
                // @ts-ignore
                var tower = t[i];
                tower.attack(h[0]);
            }
        }
        var c = this.home.find(FIND_CONSTRUCTION_SITES);
        if (this.roomPlanner.getConstruction() != undefined && c.length == 0)
            this.roomPlanner.getConstruction().pop().place();
        //Request a census every 100 ticks
        if (Game.time % 100 == 0) {
            Queue.request(new Check_Energy(this));
        }
        if (this.roomPlanner.getDistanceTransform() == undefined)
            Queue.request(new Calculate_DistanceTransform(this));
        // if (this.roomPlanner.getMinCut() == undefined) {
        //   var pos:RoomPosition[] = [];
        //   var t = this.home.find(FIND_MY_STRUCTURES);
        //   for (var i = 0; i < t.length; i ++) pos.push(t[i].pos);
        //   pos.push(this.home.controller!.pos);
        //   Queue.request(new Calculate_MinCut(this, pos));
        // }
        if (Game.flags["Flood"] != undefined)
            if (Game.flags["Flood"].room.name == this.home.name)
                Queue.request(new Calculate_FloodFill(this));
        this.checkGoals();
        //Run the spawn manger.
        this.spawnManager.check();
        this.spawnManager.spawn();
        if (Game.flags["Visuals"] != undefined)
            new VisualsManager().run(this.home.name, this.roomPlanner.getDistanceTransform(), this.roomPlanner.getFloodFill());
    }
    /**
     * checkGoals checks the goals of the colony and updates it with new roles
     * which are currently needed.
     */
    checkGoals() {
        //Search for a set of objects
        var threashold = 3;
        for (var i = 1; i <= this.home.controller.level; i++)
            threashold = threashold * 10;
        const w = this.home.find(FIND_STRUCTURES, { filter: (c) => (c.structureType == STRUCTURE_RAMPART || c.structureType == STRUCTURE_WALL) && c.hits < threashold });
        const r = this.home.find(FIND_STRUCTURES, { filter: (c) => c.hits < c.hitsMax && (c.structureType != STRUCTURE_WALL && c.structureType != STRUCTURE_RAMPART) });
        const c = this.home.find(FIND_CONSTRUCTION_SITES);
        this.home.find(FIND_SOURCES_ACTIVE);
        const s = this.home.find(FIND_MY_STRUCTURES, { filter: (s) => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0 }); //O(7 + 3n)
        if (this.home.terminal != undefined && Game.time % 1500 == 0)
            if (this.home.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < 200000)
                CreepManager.declareJob(new Job(Goals.TRADE, this.home.name));
        const h = this.home.memory.counts["STORE"];
        //Check the goals that need to be taken
        if (w != null && w.length > 0 && Game.time % 500 == 0)
            CreepManager.declareJob(new Job(Goals.REINFORCE, this.home.name));
        if (r != null && r.length > 0 && Game.time % 500 == 0)
            CreepManager.declareJob(new Job(Goals.FIX, this.home.name));
        if (c != null && c.length > 0 && Game.time % 250 == 0)
            CreepManager.declareJob(new Job(Goals.BUILD, this.home.name));
        if (s != null && s.length > 0 && Game.time % 25 == 0)
            CreepManager.declareJob(new Job(Goals.FILL, this.home.name));
        // if (d != null && d.length > 0 && Game.time % 500 == 0) CreepManager.declareJob(new Job(Goals.STORE, this.home.name));
        if (h < 6 && Game.time % 25 == 0)
            CreepManager.declareJob(new Job(Goals.STORE, this.home.name));
    }
    checkEnergyStatus() {
        if (this.home.storage == undefined)
            this.energyStatus = undefined;
        else {
            const energy = this.home.storage.store.getUsedCapacity(RESOURCE_ENERGY);
            if (energy > 450000)
                this.energyStatus = EnergyStatus.EXTREME_FLOOD;
            else if (energy > 400000)
                this.energyStatus = EnergyStatus.HIGH_FLOOD;
            else if (energy > 350000)
                this.energyStatus = EnergyStatus.FLOOD;
            else if (energy > 300000)
                this.energyStatus = EnergyStatus.MEDIUM_FLOOD;
            else if (energy > 250000)
                this.energyStatus = EnergyStatus.LIGHT_FLOOD;
            else if (energy > 200000)
                this.energyStatus = EnergyStatus.LIGHT_DROUGHT;
            else if (energy > 150000)
                this.energyStatus = EnergyStatus.MEDIUM_DROUGHT;
            else if (energy > 100000)
                this.energyStatus = EnergyStatus.DROUGHT;
            else if (energy > 50000)
                this.energyStatus = EnergyStatus.HIGH_DROUGHT;
            else
                this.energyStatus = EnergyStatus.EXTREME_DROUGHT;
        }
        this.home.memory.energyStatus = this.energyStatus;
    }
}
class Run_Colony extends template {
    //Constructor
    constructor(c) {
        super("Run Colony");
        this.colony = c;
    }
    //Methods
    run() {
        this.colony.run();
    }
}
class Check_Energy extends template {
    constructor(c) {
        super("Check Energy");
        this.colony = c;
    }
    run() { this.colony.checkEnergyStatus(); }
}
class Calculate_DistanceTransform extends template {
    //Constructor
    constructor(c) {
        super("Calculate Distance-transform");
        this.colony = c;
    }
    //Methods
    run() {
        if (this.colony.roomPlanner.computeDistanceTransform() != 0)
            Queue.request(new Calculate_DistanceTransform(this.colony));
    }
}
/**
 * Describes a basic floodfill algorithm run request. The colony is required to
 * know what roomPlanner is being asked to compute the flood and the
 */
class Calculate_FloodFill extends template {
    constructor(c) {
        super("Calculate Flood Fill");
        this.colony = c;
    }
    run() {
        if (this.colony.roomPlanner.computeFloodfill() != 0)
            Queue.request(new Calculate_FloodFill(this.colony));
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

var SortTypes;
(function (SortTypes) {
    SortTypes["PRICE"] = "price";
})(SortTypes || (SortTypes = {}));
class MarketManipulator {
    static look(r = undefined, t = undefined) {
        if (r == undefined && t == undefined)
            MarketManipulator.orders = Game.market.getAllOrders();
        else if (r != undefined && t == undefined)
            MarketManipulator.orders = Game.market.getAllOrders({ resourceType: r });
        else if (r == undefined && t != undefined && (t == ORDER_SELL || t == ORDER_BUY))
            MarketManipulator.orders = Game.market.getAllOrders({ type: t });
        else if (t == ORDER_SELL || t == ORDER_BUY)
            MarketManipulator.orders = Game.market.getAllOrders({ type: t, resourceType: r });
        else
            throw "Order type is not \"sell\" or \"buy\".";
        return 0;
    }
    static sort(t) {
        switch (t) {
            case SortTypes.PRICE: MarketManipulator.orders.sort((a, b) => b.price - a.price);
        }
        return 0;
    }
    static marketSell(r, t, a = -1) {
        if (a < 100 && a >= 0)
            return -42;
        var temp = a;
        if (Game.rooms[t].terminal != undefined)
            t = Game.rooms[t].terminal;
        else
            throw "No terminal was found in room [" + t + "]";
        if (t.cooldown > 0) {
            Queue.request(new MarketSell(r, t.room.name, a));
            return;
        }
        MarketManipulator.look(r, ORDER_BUY);
        MarketManipulator.sort(SortTypes.PRICE);
        if (a < 0)
            a = t.store.getUsedCapacity(r);
        const toSpend = Math.min(t.store.getUsedCapacity(r), a);
        if (toSpend < 100)
            return 0;
        if (MarketManipulator.orders[0] != undefined) {
            var amount = Math.min(MarketManipulator.orders[0].remainingAmount, toSpend);
            if (r == RESOURCE_ENERGY)
                if (amount + Game.market.calcTransactionCost(amount, t.room.name, MarketManipulator.orders[0].roomName) > toSpend) {
                    const delta = Game.market.calcTransactionCost(1000000, t.room.name, MarketManipulator.orders[0].roomName) / 1000000;
                    amount = Math.floor(toSpend / (1 + delta));
                }
            Game.market.deal(MarketManipulator.orders[0].id, amount, t.room.name);
            console.log("Market Sell Order [" + MarketManipulator.orders[0].id + "] " + MarketManipulator.orders[0].type + " " + MarketManipulator.orders[0].resourceType + " - " + amount + " <" + MarketManipulator.orders[0].price + ">");
            if (r != RESOURCE_ENERGY)
                Queue.request(new MarketSell(r, t.room.name, temp - amount));
            else
                Queue.request(new MarketSell(r, t.room.name, temp - amount - Game.market.calcTransactionCost(amount, t.room.name, MarketManipulator.orders[0].roomName)));
        }
        return 0;
    }
    static print() {
        console.log("Current Market View");
        for (var i = 0; i < MarketManipulator.orders.length; i++)
            console.log("[" + MarketManipulator.orders[i].id + "] " + MarketManipulator.orders[i].type + " " + MarketManipulator.orders[i].resourceType + " - " + MarketManipulator.orders[i].remainingAmount + " <" + MarketManipulator.orders[i].price + ">");
        return 0;
    }
}
MarketManipulator.orders = [];
class MarketSell extends template {
    constructor(r, t, a) {
        super("Market Sell");
        this.r = r;
        this.t = t;
        this.a = a;
    }
    run() {
        MarketManipulator.marketSell(this.r, this.t, this.a);
    }
}

//A queue object holding the items which have been queue'd to complete.
var queue = new Queue();
//A rooms object holding all the rooms.
var rooms;
new StatsManager();
//A colony array holding all of the colonies
exports.colonies = void 0;
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
module.exports.loop = function () {
    //Purge duplicate requests on ocasion
    Queue.purgeDuplicateRequests();
    //Proccess the requests from the last tick
    queue.proccessRequests();
    //Check if we have any colonies. If we don't make one.
    if (exports.colonies == undefined) {
        exports.colonies = [];
        for (let r in Game.rooms) {
            exports.colonies.push(new Colony(Game.rooms[r]));
        }
    }
    //Generate a pixel if we can.
    if (Game.cpu.bucket == 10000)
        if (Game.shard.name != "")
            Game.cpu.generatePixel();
    //Add running the colonies to the queue
    // for(var i = 0; i < colonies.length; i++) queue.queueAdd(new Setup_Goals(colonies[i]), priority.HIGH);
    for (var i = 0; i < exports.colonies.length; i++)
        queue.queueAdd(new Run_Colony(exports.colonies[i]), priority.HIGH);
    //Add items that should always be run... but only if they can be
    queue.queueAdd(new update_Rooms(rooms), priority.LOW);
    queue.queueAdd(new collect_Stats(), priority.LOW);
    queue.queueAdd(new run_CreepManager(), priority.HIGH);
    //Check if we need to init rooms again, if so do it at maximum priority
    if (rooms == undefined)
        rooms = (new init_Rooms(rooms).run());
    //Telemetry stuffs
    queue.runQueue();
};
//# sourceMappingURL=main.js.map
