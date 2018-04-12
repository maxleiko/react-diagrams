import * as _ from 'lodash';
import { observable, computed, action } from 'mobx';
import { createTransformer } from 'mobx-utils';

import { BaseModel } from './BaseModel';
import { PortModel } from './PortModel';
import { PointModel } from './PointModel';
import { BaseEntity } from '../BaseEntity';
import { LabelModel } from './LabelModel';
import { DiagramEngine } from '../DiagramEngine';
import { DiagramModel } from './DiagramModel';
import { AbstractPointFactory } from '../factories/AbstractPointFactory';

export abstract class LinkModel<S extends PortModel = PortModel, T extends PortModel = PortModel> extends BaseModel<
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

  getPortForPoint = createTransformer((point: PointModel): S | T | null => {
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

  getPointIndex = createTransformer((point: PointModel): number => {
    return this._points.findIndex((pt) => pt === point);
  });

  @observable private _sourcePort: S | null = null;
  @observable private _targetPort: T | null = null;
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

  deSerialize(ob: any, engine: DiagramEngine) {
    super.deSerialize(ob, engine);
    // deserialize points
    const points: any[] = ob.points || [];
    points.forEach((point) => {
      const p = engine.getFactoryForPoint(point).getNewInstance();
      p.deSerialize(point, engine);
      this.addPoint(p);
    });

    // deserialize labels
    const labels: any[] = ob.labels || [];
    labels.forEach((label) => {
      const l = engine.getLabelFactory(label.type).getNewInstance();
      l.deSerialize(label, engine);
      this.addLabel(l);
    });

    if (ob.source) {
      if (this.parent) {
        const node = this.parent.getNode(ob.source);
        if (node) {
          const port = node.getPortFromID(ob.sourcePort) as S | undefined;
          if (port) {
            this._sourcePort = port;
          }
        }
      }
    }

    if (ob.target) {
      if (this.parent) {
        const node = this.parent.getNode(ob.target);
        if (node) {
          const port = node.getPortFromID(ob.targetPort) as T | undefined;
          if (port) {
            this._targetPort = port;
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

  @action
  remove() {
    if (this._sourcePort) {
      this._sourcePort.removeLink(this);
    }
    if (this._targetPort) {
      this._targetPort.removeLink(this);
    }
    if (this.parent) {
      this.parent.removeLink(this);
    }
  }

  @action
  connect(source: S, target: T) {
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
  get selectedEntities(): Array<BaseModel<BaseEntity>> {
    const entities = new Array<BaseModel<BaseEntity>>();
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
  get sourcePort(): S | null {
    return this._sourcePort;
  }

  set sourcePort(port: S | null) {
    if (port) {
      port.addLink(this);
    }
    if (this._sourcePort) {
      this._sourcePort.removeLink(this);
    }
    this._sourcePort = port;
  }

  @computed
  get targetPort(): T | null {
    return this._targetPort;
  }

  set targetPort(port: T | null) {
    if (port) {
      port.addLink(this);
    }
    if (this._targetPort) {
      this._targetPort.removeLink(this);
    }
    this._targetPort = port;
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
      // tslint:disable-next-line
      console.log('ADD POINT at index', index);
      point.parent = this;
      this._points.splice(index, 0, point);
      return point;
    }
    throw new Error(`Link's first and last points are not mutable (tried to modified point at index ${index})`);
  }
}
