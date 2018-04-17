import * as _ from 'lodash';
import { observable, computed, action } from 'mobx';

import { DiagramEngine } from '../DiagramEngine';
import { Toolkit } from '../Toolkit';

/**
 * @author Dylan Vorster
 */
export abstract class BaseModel<P extends BaseModel = any> {
  private _type: string;
  @observable private _id: string;
  @observable private _locked: boolean = false;
  @observable private _selected: boolean = false;
  @observable private _parent: P | null = null;

  constructor(type: string = 'srd-base', id: string = Toolkit.UID()) {
    this._type = type;
    this._id = id;
  }

  abstract remove(): void;

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
      if (this._parent._locked) {
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
  get selectedEntities(): Array<BaseModel> {
    if (this.selected) {
      return [this];
    }
    return [];
  }

  @action
  fromJSON(ob: any, engine: DiagramEngine) {
    super.fromJSON(ob, engine);
    this._type = ob.type;
    this._selected = ob.selected;
  }

  toJSON() {
    return _.merge(super.toJSON(), {
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
  }
}
