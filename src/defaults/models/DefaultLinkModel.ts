/**
 * @author Dylan Vorster
 */
import { LinkModel } from '../../models/LinkModel';
import * as _ from 'lodash';
import { DiagramEngine } from '../../DiagramEngine';
import { DefaultLabelModel } from './DefaultLabelModel';
import { LabelModel } from '../../models/LabelModel';
import { AbstractPointFactory } from '../../factories/AbstractPointFactory';
import { computed, action, observable } from 'mobx';

export class DefaultLinkModel extends LinkModel {
  @observable private _color: string;
  @observable private _width: number = -1;
  @observable private _curvyness: number = -1;

  constructor(
    ptFactory: AbstractPointFactory,
    color: string = 'rgb(255, 255, 255, 0.6)',
    width: number = 3,
    curvyness: number = 50
  ) {
    super(ptFactory, 'srd-default-link');
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

  @action
  addLabel(label: LabelModel | string) {
    if (label instanceof LabelModel) {
      return super.addLabel(label);
    }
    const labelOb = new DefaultLabelModel();
    labelOb.title = label;
    return super.addLabel(labelOb);
  }

  @computed
  get width(): number {
    return this._width;
  }

  set width(width: number) {
    this._width = width;
  }

  @computed
  get color(): string {
    return this._color;
  }

  set color(color: string) {
    this._color = color;
  }

  @computed
  get curvyness(): number {
    return this._curvyness;
  }

  set curvyness(curvyness: number) {
    this._curvyness = curvyness;
  }
}
