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
    this.extras = ob.extras;
    this.points = _.map(ob.points || [], (point: { x: number; y: number }) => {
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
      const node = this.getParent().getNode(ob.target);
      if (node) {
        this.setTargetPort(node.getPortFromID(ob.targetPort));
      }
    }

    if (ob.source) {
      const node = this.getParent().getNode(ob.source);
      if (node) {
        this.setSourcePort(node.getPortFromID(ob.sourcePort));
      }
    }
  }

  serialize() {
    return _.merge(super.serialize(), {
      source: this.sourcePort ? this.sourcePort.getParent().id : null,
      sourcePort: this.sourcePort ? this.sourcePort.id : null,
      target: this.targetPort ? this.targetPort.getParent().id : null,
      targetPort: this.targetPort ? this.targetPort.id : null,
      points: _.map(this.points, (point) => {
        return point.serialize();
      }),
      extras: this.extras,
      labels: _.map(this.labels, (label) => {
        return label.serialize();
      })
    });
  }

  doClone(lookupTable: any = {}, clone: any) {
    clone.setPoints(
      _.map(this.getPoints(), (point: PointModel) => {
        return point.clone(lookupTable);
      })
    );
    if (this.sourcePort) {
      clone.setSourcePort(this.sourcePort.clone(lookupTable));
    }
    if (this.targetPort) {
      clone.setTargetPort(this.targetPort.clone(lookupTable));
    }
  }

  remove() {
    if (this.sourcePort) {
      this.sourcePort.removeLink(this);
    }
    if (this.targetPort) {
      this.targetPort.removeLink(this);
    }
    super.remove();
  }

  isLastPoint(point: PointModel) {
    const index = this.getPointIndex(point);
    return index === this.points.length - 1;
  }

  getPointIndex(point: PointModel) {
    return this.points.indexOf(point);
  }

  getPointModel(id: string): PointModel | undefined {
    return this.points.find((pt) => pt.id === id);
  }

  getPortForPoint(point: PointModel): PortModel | null {
    if (this.sourcePort !== null && this.getFirstPoint().getID() === point.getID()) {
      return this.sourcePort;
    }
    if (this.targetPort !== null && this.getLastPoint().getID() === point.getID()) {
      return this.targetPort;
    }
    return null;
  }

  getPointForPort(port: PortModel): PointModel | null {
    if (this.sourcePort !== null && this.sourcePort.getID() === port.getID()) {
      return this.getFirstPoint();
    }
    if (this.targetPort !== null && this.targetPort.getID() === port.getID()) {
      return this.getLastPoint();
    }
    return null;
  }

  getFirstPoint(): PointModel {
    return this.points[0];
  }

  getLastPoint(): PointModel {
    return this.points[this.points.length - 1];
  }

  setSourcePort(port: PortModel | null) {
    if (port !== null) {
      port.addLink(this);
    }
    if (this.sourcePort !== null) {
      this.sourcePort.removeLink(this);
    }
    this.sourcePort = port;
    this.iterateListeners((listener: LinkModelListener, event) => {
      if (listener.sourcePortChanged) {
        listener.sourcePortChanged({ ...event, port });
      }
    });
  }

  getSourcePort(): PortModel | null {
    return this.sourcePort;
  }

  getTargetPort(): PortModel | null {
    return this.targetPort;
  }

  setTargetPort(port: PortModel | null) {
    if (port !== null) {
      port.addLink(this);
    }
    if (this.targetPort !== null) {
      this.targetPort.removeLink(this);
    }
    this.targetPort = port;
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
    label.setParent(this);
    this.labels.push(label);
  }

  getPoints(): PointModel[] {
    return this.points;
  }

  setPoints(points: PointModel[]) {
    _.forEach(points, (point) => {
      point.setParent(this);
    });
    this.points = points;
  }

  removePoint(pointModel: PointModel) {
    this.points.splice(this.getPointIndex(pointModel), 1);
  }

  removePointsBefore(pointModel: PointModel) {
    this.points.splice(0, this.getPointIndex(pointModel));
  }

  removePointsAfter(pointModel: PointModel) {
    this.points.splice(this.getPointIndex(pointModel) + 1);
  }

  removeMiddlePoints() {
    if (this.points.length > 2) {
      this.points.splice(0, this.points.length - 2);
    }
  }

  addPoint<P extends PointModel>(pointModel: P, index: number = 1): P {
    pointModel.setParent(this);
    this.points.splice(index, 0, pointModel);
    return pointModel;
  }

  generatePoint(x: number = 0, y: number = 0): PointModel {
    return new PointModel(this, { x, y });
  }
}
