import { Toolkit } from './Toolkit';
import * as _ from 'lodash';
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

export class BaseEntity<L extends BaseListener = BaseListener> {
  private _id: string;
  private _locked: boolean = false;
  private _listeners: Map<string, L> = new Map();

  constructor(id: string = Toolkit.UID()) {
    this._id = id;
  }

  /**
   * Getter id
   * @return {string}
   */
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
  get locked(): boolean {
    return this._locked;
  }

  /**
   * Setter locked
   * @param {boolean } value
   */
  set locked(value: boolean) {
    this._locked = value;
    this.iterateListeners((listener, event) => {
      if (listener.lockChanged) {
        listener.lockChanged({ ...event, locked: value });
      }
    });
  }

  /**
   * Getter listeners
   * @return {Map<string, L> }
   */
  get listeners(): Map<string, L> {
    return this._listeners;
  }

  doClone(_lookupTable: { [s: string]: any } = {}, _clone: any) {
    /*noop*/
  }

  clone(lookupTable: { [s: string]: any } = {}) {
    // try and use an existing clone first
    if (lookupTable[this.id]) {
      return lookupTable[this.id];
    }
    const clone = _.clone(this);
    clone.id = Toolkit.UID();
    clone.clearListeners();
    lookupTable[this.id] = clone;

    this.doClone(lookupTable, clone);
    return clone;
  }

  clearListeners() {
    this._listeners.clear();
  }

  deSerialize(data: { [s: string]: any }, _engine: DiagramEngine) {
    this._id = data.id;
  }

  serialize() {
    return {
      id: this._id
    };
  }

  iterateListeners(cb: (t: L, event: BaseEvent) => any) {
    const event: BaseEvent = {
      id: Toolkit.UID(),
      firing: true,
      entity: this,
      stopPropagation: () => {
        event.firing = false;
      }
    };

    for (const uid in this._listeners) {
      if (this.listeners.hasOwnProperty(uid)) {
        const listener = this._listeners.get(uid)!;
        if (!event.firing) {
          return;
        }
        cb(listener, event);
      }
    }
  }

  removeListener(uid: string): boolean {
    return this._listeners.delete(uid);
  }

  addListener(listener: L): string {
    const uid = Toolkit.UID();
    this._listeners.set(uid, listener);
    return uid;
  }
}
