import { observable, computed, action } from 'mobx';

import { LinkModel } from '../LinkModel';
import { ABaseModel } from './ABaseModel';
import { PointModel } from '../PointModel';
import { DiagramEngine } from '../..';

export abstract class APointModel<P extends LinkModel = LinkModel> extends ABaseModel<P> implements PointModel {
  // calculated post-rendering so routing can be done correctly
  @observable private _x: number;
  @observable private _y: number;

  constructor(type: string = 'srd-point', x: number, y: number) {
    super(type);
    this._x = x;
    this._y = y;
  }

  // isConnectedToPort(): boolean {
  //   if (this.parent) {
  //     return this.parent.getPortForPoint(this) !== null;
  //   }
  //   return false;
  // }

  @action
  delete() {
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

  toJSON() {
    return {
      ...super.toJSON(),
      x: this._x,
      y: this._y
    };
  }

  fromJSON(data: any, engine: DiagramEngine) {
    super.fromJSON(data, engine);
    this._x = data.x;
    this._y = data.y;
  }
}
