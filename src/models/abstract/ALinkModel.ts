import * as _ from 'lodash';
import { observable, computed, action, IObservableArray } from 'mobx';

import { BaseModel } from '../BaseModel';
import { PortModel } from '../PortModel';
import { PointModel } from '../PointModel';
import { LabelModel } from '../LabelModel';
import { DiagramEngine } from '../../DiagramEngine';
import { DiagramModel } from '../DiagramModel';
import { AbstractPointFactory } from '../../factories/AbstractPointFactory';
import { ABaseModel } from './ABaseModel';
import { LinkModel } from '../LinkModel';

export abstract class ALinkModel extends ABaseModel<DiagramModel> implements LinkModel {
  @observable private _sourcePort: PortModel | null = null;
  @observable private _targetPort: PortModel | null = null;
  @observable private _points: PointModel[] = [];
  @observable private _labels: LabelModel[] = [];

  constructor(_pointFactory: AbstractPointFactory, linkType: string = 'srd-link', id?: string) {
    super(linkType, id);
  }

  @action
  fromJSON(ob: any, engine: DiagramEngine) {
    super.fromJSON(ob, engine);
    (this._points as IObservableArray).clear();

    if (ob.sourcePort) {
      if (this.parent) {
        const node = this.parent.nodesMap.get(ob.sourcePortParent);
        if (node) {
          const port = node.portsMap.get(ob.sourcePort);
          if (port) {
            this._sourcePort = port;
            this._sourcePort.addLink(this);
          }
        }
      }
    }

    if (ob.targetPort) {
      if (this.parent) {
        const node = this.parent.nodesMap.get(ob.targetPortParent);
        if (node) {
          const port = node.portsMap.get(ob.targetPort);
          if (port) {
            this._targetPort = port;
            this._targetPort.addLink(this);
          }
        }
      }
    }

    // fromJSON points
    const points: any[] = ob.points || [];
    points.forEach((point, i) => {
      const p = engine
        .getLinkFactory(this.type)
        .getPointFactory()
        .getNewInstance();
      p.parent = this;
      p.fromJSON(point, engine);
      this._points.splice(i, 1, p);
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
  removeAllPoints(): void {
    (this._points as IObservableArray).clear();
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
  addPoint(point: PointModel, index: number = 0): PointModel {
    // if (index > 0 && index < this._points.length) {
    point.parent = this;
    this._points.splice(index, 0, point);
    return point;
    // }
    // throw new Error(`Link's first and last points are not mutable (tried to modified point at index ${index})`);
  }

  getPointIndex(pt: PointModel): number {
    return this._points.findIndex((point) => point.id === pt.id);
  }

  isLastPoint(point: PointModel): boolean {
    return this.getPointIndex(point) === this._points.length - 1;
  }

  getPointModel(id: string): PointModel | undefined {
    return this._points.find((pt) => pt.id === id);
  }

  getLabel(id: string): LabelModel | undefined {
    return this._labels.find((l) => l.id === id);
  }
}
