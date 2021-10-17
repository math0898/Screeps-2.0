
import { Map } from "map";

/**
 *
 */
 export class Colony {

   private locale:Map = new Map();

   private center:Room;

   private outerRim:Room[];

   private defenseLevel:number;

   private economicLevel:number;

   private attackLevel:number;

   public constructor(r:Room) {
     this.center = r;
     this.locale.update(2, 2, r);
   }
 }

export class ColonyManager {

  private static colonies: Colony[];

  public static init(c:Colony[]) {
    ColonyManager.colonies = c;
  }
}
