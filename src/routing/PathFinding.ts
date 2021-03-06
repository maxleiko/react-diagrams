import * as PF from 'pathfinding';
import { DiagramEngine } from '../DiagramEngine';

/*
it can be very expensive to calculate routes when every single pixel on the canvas
is individually represented. Using the factor below, we combine values in order
to achieve the best trade-off between accuracy and performance.
*/
export const ROUTING_SCALING_FACTOR = 5;

const pathFinderInstance = new PF.JumpPointFinder({
  heuristic: PF.Heuristic.manhattan,
  diagonalMovement: PF.DiagonalMovement.Never
});

export type Path = number[][];
export interface Point {
  x: number;
  y: number;
}
export interface Link {
  start: Point;
  end: Point;
  pathToStart: Path;
  pathToEnd: Path;
}

export class PathFinding {
  instance: any;
  engine: DiagramEngine;

  constructor(engine: DiagramEngine) {
    this.instance = pathFinderInstance;
    this.engine = engine;
  }

  /**
   * Taking as argument a fully unblocked walking matrix, this method
   * finds a direct path from point A to B.
   */
  calculateDirectPath(from: Point, to: Point): Path {
    if (this.engine.canvasMatrix.length === 0) {
      this.engine.calculateCanvasMatrix();
    }
    const grid = new PF.Grid(this.engine.canvasMatrix);

    return pathFinderInstance.findPath(
      this.engine.translateRoutingX(Math.floor(from.x / ROUTING_SCALING_FACTOR)),
      this.engine.translateRoutingY(Math.floor(from.y / ROUTING_SCALING_FACTOR)),
      this.engine.translateRoutingX(Math.floor(to.x / ROUTING_SCALING_FACTOR)),
      this.engine.translateRoutingY(Math.floor(to.y / ROUTING_SCALING_FACTOR)),
      grid
    );
  }

  /**
   * Using @link{#calculateDirectPath}'s result as input, we here
   * determine the first walkable point found in the matrix that includes
   * blocked paths.
   */
  calculateLinkStartEndCoords(matrix: Path, path: Path): Link | undefined {
    const startIndex = path.findIndex((points) => matrix[points[1]][points[0]] === 0);
    const endIndex = path.length - 1 - path.slice().reverse().findIndex((point) => matrix[point[1]][point[0]] === 0);

    // are we trying to create a path exclusively through blocked areas?
    // if so, let's fallback to the linear routing
    if (startIndex === -1 || endIndex === -1) {
      return;
    }

    const pathToStart = path.slice(0, startIndex);
    const pathToEnd = path.slice(endIndex);

    return {
      start: {
        x: path[startIndex][0],
        y: path[startIndex][1]
      },
      end: {
        x: path[endIndex][0],
        y: path[endIndex][1]
      },
      pathToStart,
      pathToEnd
    };
  }

  /**
   * Puts everything together: merges the paths from/to the centre of the ports,
   * with the path calculated around other elements.
   */
  calculateDynamicPath(routingMatrix: Path, start: Point, end: Point, pathToStart: Path, pathToEnd: Path) {
    // generate the path based on the matrix with obstacles
    const grid = new PF.Grid(routingMatrix);
    const dynamicPath = pathFinderInstance.findPath(start.x, start.y, end.x, end.y, grid);

    // aggregate everything to have the calculated path ready for rendering
    const pathCoords = pathToStart
      .concat(dynamicPath, pathToEnd)
      .map((coords) => [
        this.engine.translateRoutingX(coords[0], true),
        this.engine.translateRoutingY(coords[1], true)
      ]);
    return PF.Util.compressPath(pathCoords);
  }
}
