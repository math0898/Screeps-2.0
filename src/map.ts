import { RoomData } from "Room";

/**
 * The map class describes a 5 x 5 grid of RoomData.
 */
export class Map {

  /**
   * The actual variable holding all of the data for the map class.
   */
  private grid:RoomData[][];

  /**
   * Creates a 5 x 5 matrix of degenerate room data. Each room should be added
   * using update().
   */
  public constructor() {
    this.grid = [[new RoomData(), new RoomData(), new RoomData(), new RoomData(), new RoomData()],
                 [new RoomData(), new RoomData(), new RoomData(), new RoomData(), new RoomData()],
                 [new RoomData(), new RoomData(), new RoomData(), new RoomData(), new RoomData()],
                 [new RoomData(), new RoomData(), new RoomData(), new RoomData(), new RoomData()],
                 [new RoomData(), new RoomData(), new RoomData(), new RoomData(), new RoomData()]];
  }

  /**
   * Returns the entire grid of the map.
   */
  public getMap() { return this.grid; }

  /**
   * Returns the specific entry of the map.
   *
   * @param x The x positon of the room to get.
   * @param y The y positon of the room to get.
   */
  public getRoom(x:number, y:number) { return this.grid[y][x]; }

  /**
   * Handles the updating of the grid entry at the given x and y positions. data
   * should be an instance of RoomData or Room so that all the need information
   * can be gathered. Otherwise the map will contain degenerate RoomData for
   * this position.
   *
   * @param x The x position of the room to update.
   * @param y The y position of the room to update.
   * @param data The data of the room we're updating to match.
   */
  public update(x:number, y:number, data:RoomData | Room) {
    var info:RoomData | undefined = undefined;
    if (!(data instanceof RoomData)) {
        info = new RoomData(data);
    } else info = data;
    if (info == undefined) this.grid[y][x] = new RoomData();
    else this.grid[y][x] = info;
  }
}
