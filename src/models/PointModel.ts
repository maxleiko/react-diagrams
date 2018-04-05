import { BaseModel, BaseModelListener } from './BaseModel';
import { LinkModel } from './LinkModel';
import * as _ from 'lodash';
import { DiagramEngine } from '../DiagramEngine';

export class PointModel extends BaseModel<LinkModel, BaseModelListener> {
  private _x: number;
  private _y: number;

  constructor(link: LinkModel, point: { x: number; y: number }) {
    super();
    this.parent = link;
    this._x = point.x;
    this._y = point.y;
  }

  getSelectedEntities() {
    if (this.selected && !this.isConnectedToPort()) {
      return [this];
    }
    return [];
  }

  isConnectedToPort(): boolean {
    return this.parent!.getPortForPoint(this) !== null;
  }

  deSerialize(ob: any, engine: DiagramEngine) {
    super.deSerialize(ob, engine);
    this._x = ob.x;
    this._y = ob.y;
  }

  serialize() {
    return _.merge(super.serialize(), {
      x: this._x,
      y: this._y
    });
  }

  remove() {
    // clear references
    if (this.parent) {
      this.parent.removePoint(this);
    }
    super.remove();
  }

  setPosition(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  get x(): number {
    return this._x;
  }

  set x(x: number) {
    this._x = x;
  }

  get y(): number {
    return this._y;
  }

  set y(y: number) {
    this._y = y;
  }

  get locked(): boolean {
    return this.locked || (this.parent ? this.parent.locked : false);
  }
}
