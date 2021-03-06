import * as _ from 'lodash';
import { action, computed, observable } from 'mobx';

import { DefaultPortModel } from './DefaultPortModel';
import { ANodeModel } from '../../models/abstract/ANodeModel';
import { DiagramEngine } from '../../DiagramEngine';

/**
 * @author Dylan Vorster
 */
export class DefaultNodeModel extends ANodeModel<DefaultPortModel> {
  @observable private _name: string;
  @observable private _color: string;

  constructor(name: string = 'Untitled', color: string = 'rgb(0,192,255)') {
    super('srd-default-node');
    this._name = name;
    this._color = color;
  }

  /**
   * Getter name
   * @return {string}
   */
  @computed
  get name(): string {
    return this._name;
  }

  /**
   * Setter name
   * @param {string} value
   */
  set name(value: string) {
    this._name = value;
  }

  /**
   * Getter color
   * @return {string}
   */
  @computed
  get color(): string {
    return this._color;
  }

  /**
   * Setter color
   * @param {string} value
   */
  set color(value: string) {
    this._color = value;
  }

  @action
  addInPort(name: string): DefaultPortModel {
    return this.addPort(new DefaultPortModel(true, name));
  }

  @action
  addOutPort(name: string): DefaultPortModel {
    return this.addPort(new DefaultPortModel(false, name));
  }

  @action
  fromJSON(object: any, engine: DiagramEngine) {
    super.fromJSON(object, engine);
    this.name = object.name;
    this.color = object.color;
  }

  toJSON() {
    return _.merge(super.toJSON(), {
      name: this.name,
      color: this.color
    });
  }

  @computed
  get inputs(): DefaultPortModel[] {
    return this.ports.filter((p) => p.in);
  }

  @computed
  get outputs(): DefaultPortModel[] {
    return this.ports.filter((p) => !p.in);
  }
}
