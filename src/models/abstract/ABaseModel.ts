import { observable, computed, action } from 'mobx';

import { BaseModel } from '../BaseModel';
import { Toolkit } from '../../Toolkit';
import { DiagramEngine } from '../../DiagramEngine';

export abstract class ABaseModel<P extends BaseModel = any> implements BaseModel {
  @observable private _id: string;
  @observable private _type: string;
  @observable private _locked: boolean = false;
  @observable private _selected: boolean = false;
  @observable private _parent: P | null = null;

  constructor(type: string = 'srd-base', id: string = Toolkit.UID()) {
    this._type = type;
    this._id = id;
  }

  abstract delete(): void;

  /**
   * Getter id
   * @return {string}
   */
  @computed
  get id(): string {
    return this._id;
  }

  /**
   * Setter id
   * @param {string} value
   */
  set id(value: string) {
    this._id = value;
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

  /**
   * Setter locked
   * @param {boolean } value
   */
  set locked(value: boolean) {
    this._locked = value;
  }

  @computed
  get parent(): P | null {
    return this._parent;
  }

  set parent(p: P | null) {
    this._parent = p;
  }

  @computed
  get selectedEntities(): BaseModel[] {
    if (this.selected) {
      return [this];
    }
    return [];
  }

  @action
  fromJSON(ob: any, _engine: DiagramEngine) {
    this._id = ob.id;
    this._locked = ob.locked;
    this._type = ob.type;
    this._selected = ob.selected;
  }

  toJSON() {
    return {
      id: this._id,
      locked: this._locked,
      type: this._type,
      selected: this._selected,
      parent: this._parent ? this._parent.id : null
    };
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
  }
}