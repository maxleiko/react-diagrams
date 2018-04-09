import { observable, computed } from 'mobx';

import { BaseModel } from './BaseModel';
import { LinkModel } from './LinkModel';

export class LabelModel extends BaseModel<LinkModel> {
  @observable private _offsetX: number = 0;
  @observable private _offsetY: number = 0;

  constructor(type?: string, id?: string) {
    super(type, id);
  }

  @computed
  get offsetX(): number {
    return this._offsetX;
  }

  set offsetX(offsetX: number) {
    this._offsetX = offsetX;
  }

  @computed
  get offsetY(): number {
    return this._offsetY;
  }

  set offsetY(offsetY: number) {
    this._offsetY = offsetY;
  }
}
