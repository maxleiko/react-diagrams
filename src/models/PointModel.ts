import * as _ from 'lodash';
import { observable, computed, action } from 'mobx';

import { BaseModel } from './BaseModel';
import { LinkModel } from './LinkModel';
import { DiagramEngine } from '../DiagramEngine';

export abstract class PointModel<P extends LinkModel = LinkModel> extends BaseModel<P> {
  @observable private _x: number;
  @observable private _y: number;

  constructor(type: string = 'srd-point', x: number, y: number) {
    super(type);
    this._x = x;
    this._y = y;
  }

  isConnectedToPort(): boolean {
    if (this.parent) {
      return this.parent.getPortForPoint(this) !== null;
    }
    return false;
  }

  fromJSON(ob: any, engine: DiagramEngine) {
    super.fromJSON(ob, engine);
    this._x = ob.x;
    this._y = ob.y;
  }

  toJSON() {
    return _.merge(super.toJSON(), {
      x: this._x,
      y: this._y
    });
  }

  @action
  remove() {
    // clear references
    if (this.parent) {
      this.parent.removePoint(this);
    }
  }

  @action
  setPosition(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @computed
  get x(): number {
    return this._x;
  }

  set x(x: number) {
    this._x = x;
  }

  @computed
  get y(): number {
    return this._y;
  }

  set y(y: number) {
    this._y = y;
  }
}
