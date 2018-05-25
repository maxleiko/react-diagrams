import { computed, observable, reaction, IReactionDisposer, action } from 'mobx';
import { ALabelModel } from '../../models/abstract/ALabelModel';

export class DefaultLabelModel extends ALabelModel {

  @observable private _title: string | null = null;

  private _disposer: IReactionDisposer;

  constructor(title?: string) {
    super('srd-default-label');
    this.offsetY = -23;
    if (title) {
      this._title = title;
    }

    this._disposer = reaction(() => this.selected, (selected) => {
      if (this.parent) {
        this.parent.selected = selected;
      }
    });
  }

  @computed
  get title(): string | null {
    return this._title;
  }

  set title(title: string | null) {
    this._title = title;
  }

  @action
  delete() {
    this._disposer();
    super.delete();
  }
}
