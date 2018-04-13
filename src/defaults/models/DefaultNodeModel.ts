import { DefaultPortModel } from './DefaultPortModel';
import * as _ from 'lodash';

import { NodeModel } from '../../models/NodeModel';
import { Toolkit } from '../../Toolkit';
import { DiagramEngine } from '../../DiagramEngine';
import { action, computed, observable } from 'mobx';

/**
 * @author Dylan Vorster
 */
export class DefaultNodeModel extends NodeModel<DefaultPortModel> {
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
  addInPort(label: string): DefaultPortModel {
    return this.addPort(new DefaultPortModel(true, Toolkit.UID(), label));
  }

  @action
  addOutPort(label: string): DefaultPortModel {
    return this.addPort(new DefaultPortModel(false, Toolkit.UID(), label));
  }

  deSerialize(object: any, engine: DiagramEngine) {
    super.deSerialize(object, engine);
    this.name = object.name;
    this.color = object.color;
  }

  serialize() {
    return _.merge(super.serialize(), {
      name: this.name,
      color: this.color
    });
  }

  @computed
  get inputs(): DefaultPortModel[] {
    return Array.from(this.ports.values()).filter((p) => p.in);
  }

  @computed
  get outputs(): DefaultPortModel[] {
    return Array.from(this.ports.values()).filter((p) => !p.in);
  }
}
