import { computed, observable } from 'mobx';
import { LabelModel } from '../../models/LabelModel';

export class DefaultLabelModel extends LabelModel {
  @observable private _title: string | null = null;

  constructor() {
    super('srd-default-label');
    this.offsetY = -23;
  }

  @computed
  get title(): string | null {
    return this._title;
  }

  set title(title: string | null) {
    this._title = title;
  }
}
