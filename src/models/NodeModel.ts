import { BaseModel, BaseModelListener } from './BaseModel';
import { PortModel } from './PortModel';
import * as _ from 'lodash';
import { DiagramEngine } from '../DiagramEngine';
import { DiagramModel } from './DiagramModel';

export class NodeModel extends BaseModel<DiagramModel, BaseModelListener> {
  private _x: number = 0;
  private _y: number = 0;
  private _extras: { [s: string]: any } = {};
  private _ports: Map<string, PortModel> = new Map();

  // calculated post rendering so routing can be done correctly
  private _width: number = -1;
  private _height: number = -1;

  constructor(nodeType: string = 'default', id?: string) {
    super(nodeType, id);
  }

  setPosition(x: number, y: number) {
    // store position
    const oldX = this._x;
    const oldY = this._y;
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

  getSelectedEntities(): Array<BaseModel<any, any>> {
    // add the points of each link that are selected here
    return super.getSelectedEntities().concat(
      _.flatten(Array.from(this._ports.values()).map((port) => port.getSelectedEntities()))
    );
  }

  deSerialize(ob: any, engine: DiagramEngine) {
    super.deSerialize(ob, engine);
    this._x = ob.x;
    this._y = ob.y;
    this._extras = ob.extras;

    // deserialize ports
    _.forEach(ob.ports, (port: any) => {
      const portOb = engine.getPortFactory(port.type).getNewInstance();
      portOb.deSerialize(port, engine);
      this.addPort(portOb);
    });
  }

  serialize() {
    return _.merge(super.serialize(), {
      x: this._x,
      y: this._y,
      extras: this._extras,
      ports: Array.from(this._ports.values()).map((port) => port.serialize())
    });
  }

  doClone(lookupTable: any = {}, clone: any) {
    // also clone the ports
    clone.ports = {};
    Array.from(this._ports.values())
      .forEach((port) => clone.addPort(port.clone(lookupTable)));
  }

  remove() {
    super.remove();
    this._ports.forEach((port) => {
      port.links.forEach((link) => link.remove());
    });
  }

  getPortFromID(id: string): PortModel | undefined {
    return this._ports.get(id);
  }

  get ports(): Map<string, PortModel> {
    return this._ports;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  removePort(port: PortModel) {
    // clear the parent node reference
    const p = this._ports.get(port.id);
    if (p) {
      p.parent = null;
      this._ports.delete(p.id);
    }
  }

  addPort<T extends PortModel>(port: T): T {
    port.parent = this;
    this._ports.set(port.id, port);
    return port;
  }

  updateDimensions({ width, height }: { width: number; height: number }) {
    this._width = width;
    this._height = height;
  }
}
