// tslint:disable no-bitwise
import closest from 'closest';
import { ROUTING_SCALING_FACTOR, Path } from './routing/PathFinding';
import * as SVGPath from 'paths-js/path';
import { BaseModel } from './models/BaseModel';
import { IReactionDisposer, reaction } from 'mobx';
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

  static generateLinePath(fp: { x: number; y: number }, lp: { x: number; y: number }): string {
    return `M${fp.x},${fp.y} L ${lp.x},${lp.y}`;
  }

  static generateCurvePath(fp: { x: number; y: number }, lp: { x: number; y: number }, curvy: number = 0): string {
    const isHorizontal = Math.abs(fp.x - lp.x) > Math.abs(fp.y - lp.y);
    const cX = isHorizontal ? curvy : 0;
    const cY = isHorizontal ? 0 : curvy;

    return `M${fp.x},${fp.y} C ${fp.x + cX},${fp.y + cY} ${lp.x - cX},${lp.y - cY} ${lp.x},${lp.y}`;
  }

  static generateDynamicPath(pathCoords: Path): string {
    let path = SVGPath();
    path = path.moveto(pathCoords[0][0] * ROUTING_SCALING_FACTOR, pathCoords[0][1] * ROUTING_SCALING_FACTOR);
    pathCoords.slice(1).forEach((coords) => {
      path = path.lineto(coords[0] * ROUTING_SCALING_FACTOR, coords[1] * ROUTING_SCALING_FACTOR);
    });
    return path.print();
  }

  /**
   * Automatically deletes an element from the given map when its key changes and then re-adds it with the new key
   */
  static keyUpdater<T extends BaseModel>(elem: T, prop: keyof T, map: Map<string, T>): IReactionDisposer {
    if (!elem[prop]) {
      throw new Error(`Cannot register key updater. Property "${prop}" does not exist.`);
    }
    const prevKey = elem[prop];
    if (typeof prevKey === 'string') {
      return reaction(
        () => prevKey,
        (newKey: string) => {
          if (newKey) {
            map.delete(prevKey);
            map.set(newKey, elem);
          }
        }
      );
    }
    throw new Error(`Cannot register key updater. Property "${prop}" is not a string.`);
  }
}
