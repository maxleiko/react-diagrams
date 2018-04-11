import * as _ from 'lodash';
import { observable, computed, action } from 'mobx';

import { BaseModel, BaseModelListener } from './BaseModel';
import { LinkModel } from './LinkModel';
import { DiagramEngine } from '../DiagramEngine';

export class PointModel<P extends LinkModel = LinkModel> extends BaseModel<P, BaseModelListener> {
  @observable private _x: number;
  @observable private _y: number;

  constructor(type: string = 'srd-point', x: number, y: number) {
    super(type);
    this._x = x;
    this._y = y;
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
