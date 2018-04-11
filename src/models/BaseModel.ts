import * as _ from 'lodash';
import { observable, computed, action } from 'mobx';

import { BaseEntity, BaseListener } from '../BaseEntity';
import { BaseEvent } from '../BaseEntity';
import { DiagramEngine } from '../DiagramEngine';

export interface BaseModelListener extends BaseListener {
  selectionChanged?(event: BaseEvent<BaseModel> & { isSelected: boolean }): void;

  entityRemoved?(event: BaseEvent<BaseModel>): void;
}

/**
 * @author Dylan Vorster
 */
export class BaseModel<
  P extends BaseEntity = BaseEntity,
  L extends BaseModelListener = BaseModelListener
> extends BaseEntity<L> {
  private _type: string;
  @observable private _selected: boolean = false;
  @observable private _parent: P | null = null;

  constructor(type: string = 'srd-base', id?: string) {
    super(id);
    this._type = type;
  }

  @computed
  get locked(): boolean {
    if (this._parent) {
      if (this._parent.locked) {
        // check if parent is locked first
        return true;
      }
    }
    return this._locked;
  }

  @computed
  get parent(): P | null {
    return this._parent;
  }

  set parent(p: P | null) {
    this._parent = p;
  }

  getSelectedEntities(): Array<BaseModel<any, any>> {
    if (this.selected) {
      return [this];
    }
    return [];
  }

  @action
  deSerialize(ob: any, engine: DiagramEngine) {
    super.deSerialize(ob, engine);
    this._type = ob.type;
    this._selected = ob.selected;
  }

  serialize() {
    return _.merge(super.serialize(), {
      type: this._type,
      selected: this._selected
    });
  }

  get type(): string {
    return this._type;
  }

  @computed
  get selected(): boolean {
    return this._selected;
  }

  set selected(selected: boolean) {
    this._selected = selected;
    this.iterateListeners((listener, event) => {
      if (listener.selectionChanged) {
        listener.selectionChanged({ ...event, isSelected: selected });
      }
    });
  }

  remove() {
    this.iterateListeners((listener, event) => {
      if (listener.entityRemoved) {
        listener.entityRemoved(event);
      }
    });
  }
}
