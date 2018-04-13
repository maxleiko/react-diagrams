// tslint:disable no-bitwise
// @ts-ignore
import closest from 'closest';
import { PointModel } from './models/PointModel';
import { ROUTING_SCALING_FACTOR, Path } from './routing/PathFinding';
// @ts-ignore
import * as SVGPath from 'paths-js/path';
import { DiagramEngine } from './DiagramEngine';
/**
 * @author Dylan Vorster
 */
export class Toolkit {
  static TESTING: boolean = false;
  static TESTING_UID = 0;

  /**
   * Generats a unique ID (thanks Stack overflow :3)
   * @returns {String}
   */
  static UID(): string {
    if (Toolkit.TESTING) {
      Toolkit.TESTING_UID++;
      return '' + Toolkit.TESTING_UID;
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Finds the closest element as a polyfill
   *
   * @param  {Element} element  [description]
   * @param  {string}  selector [description]
   */
  static closest(element: Element, selector: string) {
    if (document.body.closest) {
      return element.closest(selector);
    }
    return closest(element, selector);
  }

  static generateLinePath(firstPoint: PointModel, lastPoint: PointModel, engine: DiagramEngine): string {
    return `M${firstPoint.x - engine.canvasLeft},${firstPoint.y - engine.canvasTop} L ${lastPoint.x -
      engine.canvasLeft},${lastPoint.y - engine.canvasTop}`;
  }

  static generateCurvePath(
    firstPoint: PointModel,
    lastPoint: PointModel,
    curvy: number = 0,
    engine: DiagramEngine
  ): string {
    const isHorizontal = Math.abs(firstPoint.x - lastPoint.x) > Math.abs(firstPoint.y - lastPoint.y);
    const curvyX = isHorizontal ? curvy : 0;
    const curvyY = isHorizontal ? 0 : curvy;

    return `M${firstPoint.x - engine.canvasLeft},${firstPoint.y - engine.canvasTop} C ${firstPoint.x -
      engine.canvasLeft +
      curvyX},${firstPoint.y - engine.canvasTop + curvyY}
    ${lastPoint.x - engine.canvasLeft - curvyX},${lastPoint.y - engine.canvasTop - curvyY} ${lastPoint.x -
      engine.canvasLeft},${lastPoint.y - engine.canvasTop}`;
  }

  static generateDynamicPath(pathCoords: Path): string {
    let path = SVGPath();
    path = path.moveto(pathCoords[0][0] * ROUTING_SCALING_FACTOR, pathCoords[0][1] * ROUTING_SCALING_FACTOR);
    pathCoords.slice(1).forEach((coords) => {
      path = path.lineto(coords[0] * ROUTING_SCALING_FACTOR, coords[1] * ROUTING_SCALING_FACTOR);
    });
    return path.print();
  }
}
