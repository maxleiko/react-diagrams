import * as _ from 'lodash';
import { observable, computed, action } from 'mobx';

import { BaseModel } from './BaseModel';
import { PortModel } from './PortModel';
import { DiagramEngine } from '../DiagramEngine';
import { DiagramModel } from './DiagramModel';
import { BaseEntity } from '../BaseEntity';

export abstract class NodeModel<P extends PortModel = PortModel> extends BaseModel<DiagramModel> {
  @observable private _x: number = 0;
  @observable private _y: number = 0;
  @observable private _ports: Map<string, P> = new Map();

  // calculated post rendering so routing can be done correctly
  private _width: number = -1;
  private _height: number = -1;

  constructor(nodeType: string = 'srd-node', id?: string) {
    super(nodeType, id);
  }

  @action
  setPosition(x: number, y: number) {
    // store position
    const oldX = this._x;
    const oldY = this._y;
    // update positions of links
    this._ports.forEach((port) => {
      port.links.forEach((link) => {
        const point = link.getPointForPort(port);
        if (point) {
          point.x = point.x + x - oldX;
          point.y = point.y + y - oldY;
        }
      });
    });
    this._x = x;
    this._y = y;
  }

  @computed
  get selectedEntities(): Array<BaseModel<BaseEntity>> {
    const entities = new Array<BaseModel<BaseEntity>>();
    if (this.selected) {
      entities.push(this);
    }
    return entities.concat(_.flatten(Array.from(this._ports.values()).map((port) => port.selectedEntities)));
  }

  deSerialize(ob: any, engine: DiagramEngine) {
    super.deSerialize(ob, engine);
    this._x = ob.x;
    this._y = ob.y;

    // deserialize ports
    if (ob.ports) {
      ob.ports.forEach((port: any) => {
        const portOb = engine.getPortFactory(port.type).getNewInstance() as P;
        portOb.deSerialize(port, engine);
        this.addPort(portOb);
      });
    }
  }

  serialize() {
    return _.merge(super.serialize(), {
      x: this._x,
      y: this._y,
      ports: Array.from(this._ports.values()).map((port) => port.serialize())
    });
  }

  doClone(lookupTable: any = {}, clone: any) {
    // also clone the ports
    clone.ports = {};
    Array.from(this._ports.values())
      .forEach((port) => clone.addPort(port.clone(lookupTable)));
  }

  @action
  remove() {
    this._ports.forEach((port) => port.remove());
    if (this.parent) {
      this.parent.removeNode(this);
    }
  }

  getPortFromID(id: string): P | undefined {
    return this._ports.get(id);
  }

  @computed
  get ports(): Map<string, P> {
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

  set x(x: number) {
    this._x = x;
  }

  @computed
  get y(): number {
    return this._y;
  }

  set y(y: number) {
    this._y = y;
  }

  @action
  removePort(port: PortModel) {
    // clear the parent node reference
    const p = this._ports.get(port.id);
    if (p) {
      p.parent = null;
      this._ports.delete(p.id);
    }
  }

  addPort(port: P): P {
    port.parent = this;
    this._ports.set(port.id, port);
    return port;
  }

  updateDimensions({ width, height }: { width: number; height: number }) {
    this._width = width;
    this._height = height;
  }
}
