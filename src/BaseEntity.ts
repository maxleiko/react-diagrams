import { observable, computed } from 'mobx';

import { Toolkit } from './Toolkit';
import { DiagramEngine } from './DiagramEngine';

export type BaseEntityType = 'node' | 'link' | 'port' | 'point';

export abstract class BaseEntity {
  @observable private _id: string;
  @observable private _locked: boolean = false;

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

  fromJSON(data: { [s: string]: any }, _engine: DiagramEngine) {
    this._id = data.id;
  }

  toJSON() {
    return { id: this._id };
  }
}
