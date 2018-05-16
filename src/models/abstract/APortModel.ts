import * as _ from 'lodash';
import { observable, computed, action } from 'mobx';

import { PortModel } from '../PortModel';
import { BaseModel } from '../BaseModel';
import { NodeModel } from '../NodeModel';
import { LinkModel } from '../LinkModel';
import { DiagramEngine } from '../../DiagramEngine';
import { ABaseModel } from './ABaseModel';

export abstract class APortModel extends ABaseModel<NodeModel> implements PortModel {
  @observable private _maximumLinks: number;
  @observable private _links: Map<string, LinkModel> = new Map();

  // calculated post-rendering so routing can be done correctly
  @observable private _x: number = 0;
  @observable private _y: number = 0;
  @observable private _width: number = 0;
  @observable private _height: number = 0;

  constructor(name: string, type: string = 'srd-port', maximumLinks: number = Infinity) {
    super(type, name);
    this._maximumLinks = maximumLinks;
  }

  @computed
  get selectedEntities(): BaseModel[] {
    const entities: BaseModel[] = [];
    if (this.selected) {
      entities.push(this);
    }
    return entities.concat(_.flatten(this.links.map((l) => l.selectedEntities)));
  }

  @action
  fromJSON(ob: any, engine: DiagramEngine) {
    super.fromJSON(ob, engine);
    this._x = ob.x;
    this._y = ob.y;
    if (ob.maximumLinks === null) {
      this._maximumLinks = Infinity;
    } else {
      this._maximumLinks = ob.maximumLinks;
    }

    // TODO should I load links?
  }

  toJSON() {
    return {
      ...super.toJSON(),
      x: this._x,
      y: this._y,
      maximumLinks: this._maximumLinks,
      links: Array.from(this._links.keys()),
    };
  }

  canCreateLink(): boolean {
    if (this._maximumLinks === -1) {
      return true;
    }
    return this._links.size < this._maximumLinks;
  }

  @action
  removeLink(link: LinkModel) {
    return this._links.delete(link.id);
  }

  @action
  delete() {
    this._links.forEach((link) => link.delete());
    this._links.clear();
    if (this.parent) {
      this.parent.removePort(this);
      this.parent = null;
    }
  }

  @action
  addLink(link: LinkModel) {
    if (this._links.size >= this._maximumLinks) {
      throw new Error(`Port "${this.id}" cannot have more links (max: ${this._maximumLinks})`);
    }
    this._links.set(link.id, link);
  }

  @action
  setPosition(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @action
  setSize(width: number, height: number) {
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
  get links(): LinkModel[] {
    return Array.from(this._links.values());
  }

  @computed
  get linksMap(): Map<string, LinkModel> {
    return this._links;
  }

  @computed
  get connected(): boolean {
    return this._links.size > 0;
  }

  @computed
  get x(): number {
    return this._x;
  }

  @computed
  get absoluteX(): number {
    if (this.parent) {
      return this.parent.x + this._x;
    }
    return this._x;
  }

  @computed
  get y(): number {
    return this._y;
  }

  @computed
  get absoluteY(): number {
    if (this.parent) {
      return this.parent.y + this._y;
    }
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
