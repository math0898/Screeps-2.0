/**
 * Import the creepRole interface, and some debugging variables.
 */
import { Creep_Role, Creep_Prototype, debug, publicDebug } from "CreepTypes/CreepRole";
/**
 * A set of things the creep says and cycles through when mining.
 */
const mining = ["▪▪▪▪▪▪▪▪▪⛏", "▪▪▪▪▪▪▪▪⛏▪", "▪▪▪▪▪▪▪⛏▪▪", "▪▪▪▪▪▪⛏▪▪▪",
"▪▪▪▪▪⛏▪▪▪▪", "▪▪▪▪⛏▪▪▪▪▪", "▪▪▪⛏▪▪▪▪▪▪", "▪▪⛏▪▪▪▪▪▪▪", "▪⛏▪▪▪▪▪▪▪▪",
"⛏▪▪▪▪▪▪▪▪▪"]
/**
 * This is the class for the miner creep. The primary role of the miner creep
 * is to find an unworked source and to fully mine the source until the miner
 * creep dies.
 */
export class Miner extends Creep_Prototype implements Creep_Role {
  /**
   * The constructor throws the role name up to the abstract class. Otherwise
   * we don't need anything else in particular for this role.
   */
  constructor() { super("Miner"); }
  /**
   * The object version of Miner.run(Creep). There is no difference here it just
   * might be easier to call this instead of the static method in some cases.
   */
  run(creep:Creep){ Miner.run(creep); }
  /**
   * The logic for the miner role. Mostly just finding a good source and then
   * telling the creep to smart harvest.
   */
  static run(creep:Creep) {

    const sid:string | undefined = creep.memory.source;

    if (sid == undefined) {

      if (debug) creep.say('🤔', publicDebug);

      const s:Source[] | undefined = creep.room.find(FIND_SOURCES_ACTIVE);
      if (s != undefined) {
        var t: Source = s[0];
        for (var i = 1; i < s.length; i++) if (s[i].energy > t.energy) t = s[i];
        creep.memory.source = t.id;
      }

    } else {

      if (debug) {
        var a:number | undefined = creep.memory.said;
        if (a == undefined) a = 0;
        creep.say(mining[a], publicDebug);
        creep.memory.said = (a + 1) % mining.length;
      }

      creep.smartHarvest();
    }
  }
}
