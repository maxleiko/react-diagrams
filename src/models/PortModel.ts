import { BaseModel, BaseModelListener } from './BaseModel';
import { NodeModel } from './NodeModel';
import { LinkModel } from './LinkModel';
import * as _ from 'lodash';
import { DiagramEngine } from '../DiagramEngine';

export class PortModel extends BaseModel<NodeModel, BaseModelListener> {
  private _name: string;
  private _maximumLinks: number;
  private _links: Map<string, LinkModel> = new Map();

  // calculated post rendering so routing can be done correctly
  private _x: number = -1;
  private _y: number = -1;
  private _width: number = -1;
  private _height: number = -1;

  constructor(name: string, type: string, maximumLinks: number = -1, id?: string) {
    super(type, id);
    this._name = name;
    this._maximumLinks = maximumLinks;
  }

  getSelectedEntities(): Array<BaseModel<any, any>> {
    if (this.selected) {
      return ([this] as Array<BaseModel<any, any>>)
        .concat(_.flatten(Array.from(this._links.values()).map((link) => link.getSelectedEntities())));
    }
    return [];
  }

  deSerialize(ob: any, engine: DiagramEngine) {
    super.deSerialize(ob, engine);
    this._name = ob.name;
    this._maximumLinks = ob.maximumLinks;
  }

  serialize() {
    return _.merge(super.serialize(), {
      name: this._name,
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

  get name(): string {
    return this._name;
  }

  get maximumLinks(): number {
    return this._maximumLinks;
  }

  get links(): Map<string, LinkModel> {
    return this._links;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  canCreateLink(): boolean {
    if (this._maximumLinks === -1) {
      return true;
    }
    return this._links.size < this._maximumLinks;
  }

  removeLink(link: LinkModel) {
    return this._links.delete(link.id);
  }

  addLink(link: LinkModel) {
    this._links.set(link.id, link);
  }

  updateCoords({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
  }

  canLinkToPort(_port: PortModel): boolean {
    return true;
  }
}
