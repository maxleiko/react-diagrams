import * as _ from 'lodash';
import { observable, computed, action, IObservableArray } from 'mobx';
import { createTransformer } from 'mobx-utils';

import { BaseModel } from './BaseModel';
import { PortModel } from './PortModel';
import { PointModel } from './PointModel';
import { LabelModel } from './LabelModel';
import { DiagramEngine } from '../DiagramEngine';
import { DiagramModel } from './DiagramModel';
import { AbstractPointFactory } from '../factories/AbstractPointFactory';

export abstract class LinkModel extends BaseModel<
  DiagramModel
> {
  getPointForPort = createTransformer((port: PortModel): PointModel | null => {
    if (this.sourcePort && this.sourcePort.id === port.id) {
      return this.firstPoint;
    }
    if (this.targetPort && this.targetPort.id === port.id) {
      return this.lastPoint;
    }
    return null;
  });

  getPortForPoint = createTransformer((point: PointModel): PortModel | null => {
    if (this.sourcePort && this.firstPoint.id === point.id) {
      return this.sourcePort;
    }
    if (this.targetPort && this.lastPoint.id === point.id) {
      return this.targetPort;
    }
    return null;
  });

  isLastPoint = createTransformer((point: PointModel): boolean => {
    return this.getPointIndex(point) === this._points.length - 1;
  });

  getPointModel = createTransformer((id: string): PointModel | undefined => {
    return this._points.find((pt) => pt.id === id);
  });

  getLabel = createTransformer((id: string): LabelModel | undefined => {
    return this._labels.find((l) => l.id === id);
  });

  getPointIndex = createTransformer((point: PointModel): number => {
    return this._points.findIndex((pt) => pt === point);
  });

  @observable private _sourcePort: PortModel | null = null;
  @observable private _targetPort: PortModel | null = null;
  @observable private _points: PointModel[] = [];
  @observable private _labels: LabelModel[] = [];

  constructor(pointFactory: AbstractPointFactory, linkType: string = 'srd-link', id?: string) {
    super(linkType, id);
    const firstPoint = pointFactory.getNewInstance({ x: 0, y: 0 });
    firstPoint.parent = this;
    const lastPoint = pointFactory.getNewInstance({ x: 0, y: 0 });
    lastPoint.parent = this;
    this._points.push(firstPoint);
    this._points.push(lastPoint);
  }

  fromJSON(ob: any, engine: DiagramEngine) {
    super.fromJSON(ob, engine);

    if (ob.sourcePort) {
      if (this.parent) {
        const node = this.parent.getNode(ob.sourcePortParent);
        if (node) {
          const port = node.getPortFromID(ob.sourcePort) as PortModel | undefined;
          if (port) {
            this._sourcePort = port;
          }
        }
      }
    }

    if (ob.targetPort) {
      if (this.parent) {
        const node = this.parent.getNode(ob.targetPortParent);
        if (node) {
          const port = node.getPortFromID(ob.targetPort) as PortModel | undefined;
          if (port) {
            this._targetPort = port;
          }
        }
      }
    }

    // fromJSON points
    const points: any[] = ob.points || [];
    points.forEach((point) => {
      const p = engine.getLinkFactory(this.type).getPointFactory().getNewInstance();
      p.parent = this;
      p.fromJSON(point, engine);
      this.addPoint(p);
    });

    // fromJSON labels
    const labels: any[] = ob.labels || [];
    labels.forEach((label) => {
      const l = engine.getLabelFactory(label.type).getNewInstance();
      l.parent = this;
      l.fromJSON(label, engine);
      this.addLabel(l);
    });
  }

  toJSON() {
    return {
      ...super.toJSON(),
      sourcePort: this._sourcePort ? this._sourcePort.id : null,
      sourcePortParent: this._sourcePort ? (this._sourcePort.parent ? this._sourcePort.parent.id : null) : null,
      targetPort: this._targetPort ? this._targetPort.id : null,
      targetPortParent: this._targetPort ? (this._targetPort.parent ? this._targetPort.parent.id : null) : null,
      points: this._points.map((point) => point.toJSON()),
      labels: this._labels.map((label) => label.toJSON())
    };
  }

  @action
  delete() {
    if (this._sourcePort) {
      this._sourcePort.removeLink(this);
      this._sourcePort = null;
    }
    if (this._targetPort) {
      this._targetPort.removeLink(this);
      this._targetPort = null;
    }
    (this._points as IObservableArray<PointModel>).clear();
    (this._labels as IObservableArray<LabelModel>).clear();
    if (this.parent) {
      this.parent.removeLink(this);
      this.parent = null;
    }
  }

  @action
  connect(source: PortModel, target: PortModel) {
    this.sourcePort = source;
    this.targetPort = target;
  }

  @computed
  get firstPoint(): PointModel {
    return this._points[0];
  }

  @computed
  get lastPoint(): PointModel {
    return this._points[this._points.length - 1];
  }

  @computed
  get selectedEntities(): BaseModel[] {
    const entities: BaseModel[] = [];
    if (this.selected) {
      entities.push(this);
    }
    return entities.concat(_.flatten(this._points.map((pt) => pt.selectedEntities)));
  }

  @computed
  get labels(): LabelModel[] {
    return this._labels;
  }

  @computed
  get sourcePort(): PortModel | null {
    return this._sourcePort;
  }

  set sourcePort(port: PortModel | null) {
    this._sourcePort = port;
    if (port) {
      port.addLink(this);
    }
  }

  @computed
  get targetPort(): PortModel | null {
    return this._targetPort;
  }

  set targetPort(port: PortModel | null) {
    this._targetPort = port;
    if (port) {
      port.addLink(this);
    }
  }

  @action
  addLabel(label: LabelModel) {
    label.parent = this;
    this._labels.push(label);
  }

  @computed
  get points(): PointModel[] {
    return this._points;
  }

  @action
  removePoint(point: PointModel) {
    this._points.splice(this.getPointIndex(point), 1);
  }

  @action
  removeLabel(label: LabelModel) {
    this._labels.splice(this.labels.findIndex((l) => l.id === label.id), 1);
  }

  @action
  removePointsBefore(point: PointModel) {
    this._points.splice(0, this.getPointIndex(point));
  }

  @action
  removePointsAfter(point: PointModel) {
    this._points.splice(this.getPointIndex(point) + 1);
  }

  @action
  removeMiddlePoints() {
    if (this._points.length > 2) {
      this._points.splice(0, this._points.length - 2);
    }
  }

  @action
  addPoint(point: PointModel, index: number = 1): PointModel {
    if (index > 0 && index < this._points.length) {
      point.parent = this;
      this._points.splice(index, 0, point);
      return point;
    }
    throw new Error(`Link's first and last points are not mutable (tried to modified point at index ${index})`);
  }
}
