import { DefaultPortModel } from './DefaultPortModel';
import * as _ from 'lodash';

import { NodeModel } from '../../models/NodeModel';
import { Toolkit } from '../../Toolkit';
import { DiagramEngine } from '../../DiagramEngine';

/**
 * @author Dylan Vorster
 */
export class DefaultNodeModel extends NodeModel {
  private _name: string;
  private _color: string;

  constructor(name: string = 'Untitled', color: string = 'rgb(0,192,255)') {
    super('default');
    this._name = name;
    this._color = color;
  }

  /**
   * Getter name
   * @return {string}
   */
  get name(): string {
    return this._name;
  }

  /**
   * Getter color
   * @return {string}
   */
  get color(): string {
    return this._color;
  }

  /**
   * Setter name
   * @param {string} value
   */
  set name(value: string) {
    this._name = value;
  }

  /**
   * Setter color
   * @param {string} value
   */
  set color(value: string) {
    this._color = value;
  }

  addInPort(label: string): DefaultPortModel {
    return this.addPort(new DefaultPortModel(true, Toolkit.UID(), label));
  }

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

  getInPorts(): DefaultPortModel[] {
    return _.filter(this.ports, (portModel) => {
      return portModel.in;
    });
  }

  getOutPorts(): DefaultPortModel[] {
    return _.filter(this.ports, (portModel) => {
      return !portModel.in;
    });
  }
}
