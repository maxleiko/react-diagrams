import * as _ from 'lodash';
import { observable, computed } from 'mobx';

import { Toolkit } from './Toolkit';
import { DiagramEngine } from './DiagramEngine';

/**
 * @author Dylan Vorster
 */
export interface BaseEvent<T extends BaseEntity = any> {
  entity: T;
  stopPropagation: () => any;
  firing: boolean;
  id: string;
}

export type BaseEntityType = 'node' | 'link' | 'port' | 'point';

export abstract class BaseEntity {
  @observable private _id: string;
  @observable protected _locked: boolean = false;

  constructor(id: string = Toolkit.UID()) {
    this._id = id;
  }

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

  /**
   * Getter locked
   * @return {boolean }
   */
  @computed
  get locked(): boolean {
    return this._locked;
  }

  /**
   * Setter locked
   * @param {boolean } value
   */
  set locked(value: boolean) {
    this._locked = value;
  }

  doClone(_lookupTable: { [s: string]: any } = {}, _clone: any) {
    /*noop*/
  }

  clone(lookupTable: { [s: string]: any } = {}): this {
    // try and use an existing clone first
    if (lookupTable[this.id]) {
      return lookupTable[this.id];
    }
    const clone = _.clone(this);
    clone.id = Toolkit.UID();
    // clone.clearListeners();
    lookupTable[this.id] = clone;

    this.doClone(lookupTable, clone);
    return clone;
  }

  // @action
  // clearListeners() {
  //   this._listeners.clear();
  // }

  deSerialize(data: { [s: string]: any }, _engine: DiagramEngine) {
    this._id = data.id;
  }

  serialize() {
    return {
      id: this._id
    };
  }
}
