import { DiagramEngine } from '../DiagramEngine';
export declare const ROUTING_SCALING_FACTOR = 5;
export declare type Path = number[][];
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
export declare class PathFinding {
    instance: any;
    engine: DiagramEngine;
    constructor(engine: DiagramEngine);
    /**
     * Taking as argument a fully unblocked walking matrix, this method
     * finds a direct path from point A to B.
     */
    calculateDirectPath(from: Point, to: Point): Path;
    /**
     * Using @link{#calculateDirectPath}'s result as input, we here
     * determine the first walkable point found in the matrix that includes
     * blocked paths.
     */
    calculateLinkStartEndCoords(matrix: Path, path: Path): Link | undefined;
    /**
     * Puts everything together: merges the paths from/to the centre of the ports,
     * with the path calculated around other elements.
     */
    calculateDynamicPath(routingMatrix: Path, start: Point, end: Point, pathToStart: Path, pathToEnd: Path): any;
}
