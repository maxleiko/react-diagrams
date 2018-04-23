import { computed, observable } from 'mobx';
import { ALabelModel } from '../../models/abstract/ALabelModel';

export class DefaultLabelModel extends ALabelModel {
  @observable private _title: string | null = null;

  constructor(title?: string) {
    super('srd-default-label');
    this.offsetY = -23;
    if (title) {
      this._title = title;
    }
  }

  @computed
  get title(): string | null {
    return this._title;
  }

  set title(title: string | null) {
    this._title = title;
  }
}
