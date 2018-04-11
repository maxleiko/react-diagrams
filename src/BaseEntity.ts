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

export interface BaseListener<T extends BaseEntity = any> {
  lockChanged?(event: BaseEvent<T> & { locked: boolean }): void;
}

export type BaseEntityType = 'node' | 'link' | 'port' | 'point';

export abstract class BaseEntity<L extends BaseListener = BaseListener> {
  @observable private _id: string;
  @observable private _listeners: Map<string, L> = new Map();
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
    // this.iterateListeners((listener, event) => {
    //   if (listener.lockChanged) {
    //     listener.lockChanged({ ...event, locked: value });
    //   }
    // });
  }

  /**
   * Getter listeners
   * @return {Map<string, L> }
   */
  @computed
  get listeners(): Map<string, L> {
    return this._listeners;
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

  // iterateListeners(cb: (t: L, event: BaseEvent) => any) {
  //   const event: BaseEvent = {
  //     id: Toolkit.UID(),
  //     firing: true,
  //     entity: this,
  //     stopPropagation: () => {
  //       event.firing = false;
  //     }
  //   };

  //   for (const uid in this._listeners) {
  //     if (this.listeners.hasOwnProperty(uid)) {
  //       const listener = this._listeners.get(uid)!;
  //       if (!event.firing) {
  //         return;
  //       }
  //       action(cb(listener, event));
  //     }
  //   }
  // }

  // @action
  // removeListener(uid: string): boolean {
  //   return this._listeners.delete(uid);
  // }

  // @action
  // addListener(listener: L): string {
  //   const uid = Toolkit.UID();
  //   this._listeners.set(uid, listener);
  //   return uid;
  // }
}
