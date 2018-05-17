import * as _ from 'lodash';
import { observable, computed, action } from 'mobx';

import { BaseModel } from '../BaseModel';
import { PortModel } from '../PortModel';
import { DiagramEngine } from '../../DiagramEngine';
import { DiagramModel } from '../DiagramModel';
import { NodeModel } from '../NodeModel';
import { ABaseModel } from './ABaseModel';

export abstract class ANodeModel<P extends PortModel = PortModel> extends ABaseModel<DiagramModel>
  implements NodeModel {
  @observable private _x: number = 0;
  @observable private _y: number = 0;
  @observable private _ports: Map<string, P> = new Map();

  // calculated post rendering so routing can be done correctly
  private _width: number = 0;
  private _height: number = 0;

  constructor(nodeType: string = 'srd-node', id?: string) {
    super(nodeType, id);
  }

  @action
  setPosition(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @computed
  get selectedEntities(): BaseModel[] {
    const entities: BaseModel[] = [];
    if (this.selected) {
      entities.push(this);
    }
    return entities.concat(_.flatten(this.ports.map((port) => port.selectedEntities)));
  }

  @action
  fromJSON(ob: any, engine: DiagramEngine) {
    super.fromJSON(ob, engine);
    this._x = ob.x;
    this._y = ob.y;

    // fromJSON ports
    if (ob.ports) {
      ob.ports.forEach((port: any) => {
        const portOb = engine.getPortFactory(port.type).getNewInstance() as P;
        portOb.parent = this;
        portOb.fromJSON(port, engine);
        this.addPort(portOb);
      });
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      x: this._x,
      y: this._y,
      ports: this.ports.map((port) => port.toJSON())
    };
  }

  @action
  delete() {
    this.ports.forEach((port) => port.delete());
    if (this.parent) {
      this.parent.removeNode(this);
    }
  }

  @computed
  get ports(): P[] {
    return Array.from(this._ports.values());
  }

  @computed
  get portsMap(): Map<string, P> {
    return this._ports;
  }

  @computed
  get width(): number {
    return this._width;
  }

  set width(width: number) {
    this._width = width;
  }

  @computed
  get height(): number {
    return this._height;
  }

  set height(height: number) {
    this._height = height;
  }

  @computed
  get x(): number {
    return this._x;
  }

  @computed
  get y(): number {
    return this._y;
  }

  @action
  removePort(port: PortModel) {
    // clear the parent node reference
    const p = this._ports.get(port.id);
    if (p) {
      this._ports.delete(p.id);
      p.parent = null;
    }
  }

  @action
  addPort(port: P): P {
    port.parent = this;
    this._ports.set(port.id, port);
    return port;
  }

  @action
  setSize(width: number, height: number) {
    this._width = width;
    this._height = height;
  }
}
