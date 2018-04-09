/**
 * @author Dylan Vorster
 */
import { LinkModel, LinkModelListener } from '../../models/LinkModel';
import { BaseEvent } from '../../BaseEntity';
import * as _ from 'lodash';
import { DiagramEngine } from '../../DiagramEngine';
import { DefaultLabelModel } from './DefaultLabelModel';
import { LabelModel } from '../../models/LabelModel';
import { DefaultPortModel } from './DefaultPortModel';

export interface DefaultLinkModelListener extends LinkModelListener<DefaultPortModel, DefaultPortModel> {
  colorChanged?(event: BaseEvent<DefaultLinkModel> & { color: null | string }): void;
  widthChanged?(event: BaseEvent<DefaultLinkModel> & { width: 0 | number }): void;
  curvynessChanged?(event: BaseEvent<DefaultLinkModel> & { curvyness: 0 | number }): void;
}

export class DefaultLinkModel extends LinkModel<DefaultLinkModelListener, DefaultPortModel, DefaultPortModel> {
  private _color: string;
  private _width: number = -1;
  private _curvyness: number = -1;

  constructor(
    type: string = 'default',
    color: string = 'rgb(255, 255, 255, 0.6)',
    width: number = 3,
    curvyness: number = 50
  ) {
    super(type);
    this._color = color;
    this._width = width;
    this._curvyness = curvyness;
  }

  serialize() {
    return _.merge(super.serialize(), {
      width: this.width,
      color: this.color,
      curvyness: this.curvyness
    });
  }

  deSerialize(ob: any, engine: DiagramEngine) {
    super.deSerialize(ob, engine);
    this.color = ob.color;
    this.width = ob.width;
    this.curvyness = ob.curvyness;
  }

  addLabel(label: LabelModel | string) {
    if (label instanceof LabelModel) {
      return super.addLabel(label);
    }
    const labelOb = new DefaultLabelModel();
    labelOb.label = label;
    return super.addLabel(labelOb);
  }

  get width(): number {
    return this._width;
  }

  set width(width: number) {
    this._width = width;
    this.iterateListeners((listener: DefaultLinkModelListener, event: BaseEvent) => {
      if (listener.widthChanged) {
        listener.widthChanged({ ...event, width });
      }
    });
  }

  get color(): string {
    return this._color;
  }

  set color(color: string) {
    this._color = color;
    this.iterateListeners((listener: DefaultLinkModelListener, event: BaseEvent) => {
      if (listener.colorChanged) {
        listener.colorChanged({ ...event, color });
      }
    });
  }

  get curvyness(): number {
    return this._curvyness;
  }

  set curvyness(curvyness: number) {
    this._curvyness = curvyness;
    this.iterateListeners((listener: DefaultLinkModelListener, event: BaseEvent) => {
      if (listener.curvynessChanged) {
        listener.curvynessChanged({ ...event, curvyness });
      }
    });
  }
}
