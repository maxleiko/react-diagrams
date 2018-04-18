import * as _ from 'lodash';
import { observable, computed, action } from 'mobx';

import { BaseModel } from './BaseModel';
import { NodeModel } from './NodeModel';
import { LinkModel } from './LinkModel';
import { DiagramEngine } from '../DiagramEngine';
import { createTransformer } from 'mobx-utils';

export abstract class PortModel extends BaseModel<NodeModel> {
  getLink = createTransformer((id: string): LinkModel | undefined => this._links.get(id));

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
  get selectedEntities(): BaseModel[] {
    const entities: BaseModel[] = [];
    if (this.selected) {
      entities.push(this);
    }
    return entities.concat(_.flatten(this.links.map((l) => l.selectedEntities)));
  }

  fromJSON(ob: any, engine: DiagramEngine) {
    super.fromJSON(ob, engine);
    this._maximumLinks = ob.maximumLinks;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      links: Array.from(this._links.keys()),
      maximumLinks: this._maximumLinks
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
    this._links.set(link.id, link);
  }

  @action
  setPosition(x: number, y: number) {
    this._x = x;
    this._y = y;
    this._links.forEach((link) => {
      const point = link.getPointForPort(this);
      if (point) {
        point.setPosition(x, y);
      }
    });
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
