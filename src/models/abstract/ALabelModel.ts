import { observable, computed, action } from 'mobx';

import { LinkModel } from '../LinkModel';
import { ABaseModel } from './ABaseModel';
import { LabelModel } from '../LabelModel';

export abstract class ALabelModel extends ABaseModel<LinkModel> implements LabelModel {
  @observable private _offsetX: number = 0;
  @observable private _offsetY: number = 0;

  constructor(type: string = 'srd-label', id?: string) {
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

  @action
  delete() {
    if (this.parent) {
      this.parent.removeLabel(this);
    }
  }
}
