import * as _ from 'lodash';
import { observable, computed, action } from 'mobx';
import { createTransformer } from 'mobx-utils';

import { BaseModel, BaseModelListener } from './BaseModel';
import { PortModel } from './PortModel';
import { PointModel } from './PointModel';
import { BaseEvent, BaseEntity } from '../BaseEntity';
import { LabelModel } from './LabelModel';
import { DiagramEngine } from '../DiagramEngine';
import { DiagramModel } from './DiagramModel';

export interface LinkModelListener<S extends PortModel = PortModel, T extends PortModel = PortModel>
  extends BaseModelListener {
  sourcePortChanged?(event: BaseEvent<LinkModel> & { port: S | null }): void;
  targetPortChanged?(event: BaseEvent<LinkModel> & { port: T | null }): void;
}

export class LinkModel<
  L extends LinkModelListener<S, T> = LinkModelListener<S, T>,
  S extends PortModel = PortModel,
  T extends PortModel = PortModel,
  P extends PointModel = PointModel,
> extends BaseModel<DiagramModel, L> {
  getPointForPort = createTransformer((port: PortModel): P | null => {
    if (this._sourcePort !== null && this._sourcePort.id === port.id) {
      return this.firstPoint;
    }
    if (this._targetPort !== null && this._targetPort.id === port.id) {
      return this.lastPoint;
    }
    return null;
  });

  getPortForPoint = createTransformer((point: P): S | T | null => {
    if (this._sourcePort !== null && this.firstPoint.id === point.id) {
      return this._sourcePort;
    }
    if (this._targetPort !== null && this.lastPoint.id === point.id) {
      return this._targetPort;
    }
    return null;
  });

  isLastPoint = createTransformer((point: P): boolean => {
    return this.getPointIndex(point) === this._points.length - 1;
  });

  getPointModel = createTransformer((id: string): P | undefined => {
    return this._points.find((pt) => pt.id === id);
  });

  getPointIndex = createTransformer((point: P): number => {
    return this._points.findIndex((pt) => pt === point);
  });

  @observable private _sourcePort: S | null = null;
  @observable private _targetPort: T | null = null;
  @observable private _labels: LabelModel[] = [];
  @observable private _points: P[] = [];

  constructor(linkType: string = 'srd-link', id?: string) {
    super(linkType, id);
  }

  deSerialize(ob: any, engine: DiagramEngine) {
    super.deSerialize(ob, engine);
    // deserialize points
    const points: any[] = ob.points || [];
    points.forEach((point) => {
      const p = engine.getPointFactory(point.type).getNewInstance() as P;
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
    super.remove();
    
  }

  @computed
  get firstPoint(): P {
    return this._points[0];
  }

  @computed
  get lastPoint(): P {
    return this._points[this._points.length - 1];
  }

  @computed
  get selectedEntities(): Array<BaseModel<BaseEntity, BaseModelListener>> {
    if (this.selected) {
      return new Array<BaseModel<BaseEntity, BaseModelListener>>(this)
        .concat(_.flatten(this._points.map((pt) => pt.selectedEntities)));
    }
    return [];
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
    // this.iterateListeners((listener: LinkModelListener, event) => {
    //   if (listener.sourcePortChanged) {
    //     listener.sourcePortChanged({ ...event, port });
    //   }
    // });
  }

  @computed
  get targetPort(): T | null {
    return this._targetPort;
  }

  set targetPort(port: T | null) {
    if (port) {
      port.addLink(this);
    }
    if (this.targetPort) {
      this.targetPort.removeLink(this);
    }
    this._targetPort = port;
    // this.iterateListeners((listener: LinkModelListener, event) => {
    //   if (listener.targetPortChanged) {
    //     listener.targetPortChanged({ ...event, port });
    //   }
    // });
  }

  @action
  addLabel(label: LabelModel) {
    label.parent = this;
    this._labels.push(label);
  }

  @computed
  get points(): P[] {
    return this._points;
  }

  set points(points: P[]) {
    this._points = points;
    this._points.forEach((point) => (point.parent = this));
  }

  @action
  removePoint(point: P) {
    this._points.splice(this.getPointIndex(point), 1);
  }

  @action
  removePointsBefore(point: P) {
    this._points.splice(0, this.getPointIndex(point));
  }

  @action
  removePointsAfter(point: P) {
    this._points.splice(this.getPointIndex(point) + 1);
  }

  @action
  removeMiddlePoints() {
    if (this._points.length > 2) {
      this._points.splice(0, this._points.length - 2);
    }
  }

  @action
  addPoint(point: P, index: number = 1): P {
    point.parent = this;
    this._points.splice(index, 0, point);
    return point;
  }
}
