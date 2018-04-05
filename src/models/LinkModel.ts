import { BaseModel, BaseModelListener } from './BaseModel';
import { PortModel } from './PortModel';
import { PointModel } from './PointModel';
import * as _ from 'lodash';
import { BaseEvent } from '../BaseEntity';
import { LabelModel } from './LabelModel';
import { DiagramEngine } from '../DiagramEngine';
import { DiagramModel } from './DiagramModel';

export interface LinkModelListener extends BaseModelListener {
  sourcePortChanged?(event: BaseEvent<LinkModel> & { port: null | PortModel }): void;
  targetPortChanged?(event: BaseEvent<LinkModel> & { port: null | PortModel }): void;
}

export class LinkModel<T extends LinkModelListener = LinkModelListener> extends BaseModel<DiagramModel, T> {
  private _sourcePort: PortModel | null = null;
  private _targetPort: PortModel | null = null;
  private _labels: LabelModel[] = [];
  private _extras: { [s: string]: any } = {};
  private _points: PointModel[] = [
    new PointModel(this, { x: 0, y: 0 }),
    new PointModel(this, { x: 0, y: 0 })
  ];

  constructor(linkType: string = 'default', id?: string) {
    super(linkType, id);
  }

  deSerialize(ob: any, engine: DiagramEngine) {
    super.deSerialize(ob, engine);
    this._extras = ob.extras;
    this._points = _.map(ob.points || [], (point: { x: number; y: number }) => {
      const p = new PointModel(this, { x: point.x, y: point.y });
      p.deSerialize(point, engine);
      return p;
    });

    // deserialize labels
    _.forEach(ob.labels || [], (label: any) => {
      const labelOb = engine.getLabelFactory(label.type).getNewInstance();
      labelOb.deSerialize(label, engine);
      this.addLabel(labelOb);
    });

    if (ob.target) {
      if (this.parent) {
        const node = this.parent.getNode(ob.target);
        if (node) {
          const port = node.getPortFromID(ob.targetPort);
          if (port) {
            this._targetPort = port;
          }
        }
      }
    }

    if (ob.source) {
      if (this.parent) {
        const node = this.parent.getNode(ob.source);
        if (node) {
          const port = node.getPortFromID(ob.sourcePort);
          if (port) {
            this._sourcePort = port;
          }
        }
      }
    }
  }

  serialize() {
    return _.merge(super.serialize(), {
      source: this._sourcePort ? (this._sourcePort.parent ? this._sourcePort.parent.id : null) : null,
      sourcePort: this._sourcePort ? this._sourcePort.id : null,
      target: this._targetPort ? (this._targetPort.parent ? this._targetPort.parent.id : null) : null,
      targetPort: this._targetPort ? this._targetPort.id : null,
      points: _.map(this._points, (point) => {
        return point.serialize();
      }),
      extras: this._extras,
      labels: this._labels.map((label) => label.serialize())
    });
  }

  doClone(lookupTable: any = {}, clone: any) {
    clone.points = this._points.map((point) => point.clone(lookupTable));
    if (this._sourcePort) {
      clone.setSourcePort(this._sourcePort.clone(lookupTable));
    }
    if (this._targetPort) {
      clone.setTargetPort(this._targetPort.clone(lookupTable));
    }
  }

  remove() {
    if (this._sourcePort) {
      this._sourcePort.removeLink(this);
    }
    if (this._targetPort) {
      this._targetPort.removeLink(this);
    }
    super.remove();
  }

  isLastPoint(point: PointModel) {
    const index = this.getPointIndex(point);
    return index === this._points.length - 1;
  }

  getPointIndex(point: PointModel) {
    return this._points.indexOf(point);
  }

  getPointModel(id: string): PointModel | undefined {
    return this._points.find((pt) => pt.id === id);
  }

  getPortForPoint(point: PointModel): PortModel | null {
    if (this._sourcePort !== null && this.getFirstPoint().id === point.id) {
      return this._sourcePort;
    }
    if (this._targetPort !== null && this.getLastPoint().id === point.id) {
      return this._targetPort;
    }
    return null;
  }

  getPointForPort(port: PortModel): PointModel | null {
    if (this._sourcePort !== null && this._sourcePort.id === port.id) {
      return this.getFirstPoint();
    }
    if (this._targetPort !== null && this._targetPort.id === port.id) {
      return this.getLastPoint();
    }
    return null;
  }

  getFirstPoint(): PointModel {
    return this._points[0];
  }

  getLastPoint(): PointModel {
    return this._points[this._points.length - 1];
  }

  get labels(): LabelModel[] {
    return this._labels;
  }

  get sourcePort(): PortModel | null {
    return this._sourcePort;
  }

  set sourcePort(port: PortModel | null) {
    if (port !== null) {
      port.addLink(this);
    }
    if (this._sourcePort !== null) {
      this._sourcePort.removeLink(this);
    }
    this._sourcePort = port;
    this.iterateListeners((listener: LinkModelListener, event) => {
      if (listener.sourcePortChanged) {
        listener.sourcePortChanged({ ...event, port });
      }
    });
  }

  get targetPort(): PortModel | null {
    return this._targetPort;
  }

  set targetPort(port: PortModel | null) {
    if (port !== null) {
      port.addLink(this);
    }
    if (this.targetPort !== null) {
      this.targetPort.removeLink(this);
    }
    this._targetPort = port;
    this.iterateListeners((listener: LinkModelListener, event) => {
      if (listener.targetPortChanged) {
        listener.targetPortChanged({ ...event, port });
      }
    });
  }

  point(x: number, y: number): PointModel {
    return this.addPoint(this.generatePoint(x, y));
  }

  addLabel(label: LabelModel) {
    label.parent = this;
    this._labels.push(label);
  }

  get points(): PointModel[] {
    return this._points;
  }

  set points(points: PointModel[]) {
    this._points = points;
    this._points.forEach((point) => point.parent = this);
  }

  removePoint(pointModel: PointModel) {
    this._points.splice(this.getPointIndex(pointModel), 1);
  }

  removePointsBefore(pointModel: PointModel) {
    this._points.splice(0, this.getPointIndex(pointModel));
  }

  removePointsAfter(pointModel: PointModel) {
    this._points.splice(this.getPointIndex(pointModel) + 1);
  }

  removeMiddlePoints() {
    if (this._points.length > 2) {
      this._points.splice(0, this._points.length - 2);
    }
  }

  addPoint<P extends PointModel>(pointModel: P, index: number = 1): P {
    pointModel.parent = this;
    this._points.splice(index, 0, pointModel);
    return pointModel;
  }

  generatePoint(x: number = 0, y: number = 0): PointModel {
    return new PointModel(this, { x, y });
  }
}
