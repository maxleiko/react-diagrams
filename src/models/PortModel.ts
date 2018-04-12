import * as _ from 'lodash';
import { observable, computed, action } from 'mobx';

import { BaseModel } from './BaseModel';
import { NodeModel } from './NodeModel';
import { LinkModel } from './LinkModel';
import { DiagramEngine } from '../DiagramEngine';
import { BaseEntity } from '../BaseEntity';

export abstract class PortModel extends BaseModel<NodeModel> {
  @observable private _maximumLinks: number;
  @observable private _links: Map<string, LinkModel> = new Map();

  // calculated post rendering so routing can be done correctly
  @observable private _x: number = -1;
  @observable private _y: number = -1;
  @observable private _width: number = -1;
  @observable private _height: number = -1;

  constructor(name: string, type: string = 'srd-port', maximumLinks: number = -1) {
    super(type, name);
    this._maximumLinks = maximumLinks;
  }

  @computed
  get selectedEntities(): Array<BaseModel<BaseEntity>> {
    const entities = new Array<BaseModel<BaseEntity>>();
    if (this.selected) {
      entities.push(this);
    }
    return entities.concat(_.flatten(Array.from(this._links.values()).map((l) => l.selectedEntities)));
  }

  deSerialize(ob: any, engine: DiagramEngine) {
    super.deSerialize(ob, engine);
    this._maximumLinks = ob.maximumLinks;
  }

  serialize() {
    return _.merge(super.serialize(), {
      parentNode: this.parent ? this.parent.id : null,
      links: this._links.keys(),
      maximumLinks: this._maximumLinks
    });
  }

  doClone(lookupTable: any = {}, clone: any) {
    clone.links = {};
    if (this.parent) {
      clone.parentNode = this.parent.clone(lookupTable);
    }
  }

  canCreateLink(): boolean {
    if (this._maximumLinks === -1) {
      return true;
    }
    return this._links.size < this._maximumLinks;
  }

  @action
  removeLink(link: LinkModel<PortModel, PortModel>) {
    return this._links.delete(link.id);
  }

  @action
  remove() {
    if (this.parent) {
      this.parent.removePort(this);
    }
  }

  @action
  addLink(link: LinkModel<PortModel, PortModel>) {
    this._links.set(link.id, link);
  }

  @action
  updateCoords({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
  }

  canLinkToPort(_port: PortModel): boolean {
    return true;
  }

  @computed
  get maximumLinks(): number {
    return this._maximumLinks;
  }

  @computed
  get links(): Map<string, LinkModel> {
    return this._links;
  }

  @computed
  get x(): number {
    return this._x;
  }

  @computed
  get y(): number {
    return this._y;
  }

  @computed
  get width(): number {
    return this._width;
  }

  @computed
  get height(): number {
    return this._height;
  }
}
