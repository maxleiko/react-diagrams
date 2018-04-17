import * as _ from 'lodash';
import { observable, computed, action } from 'mobx';

import { BaseEntity } from '../BaseEntity';
import { DiagramEngine } from '../DiagramEngine';
import { LinkModel } from './LinkModel';
import { NodeModel } from './NodeModel';
import { BaseModel } from './BaseModel';
import { PortModel } from './PortModel';
import { createTransformer } from 'mobx-utils';

export class DiagramModel extends BaseEntity {
  getNode = createTransformer((id: string): NodeModel<PortModel> | undefined => {
    return this._nodes.get(id);
  });

  getLink = createTransformer((id: string): LinkModel | undefined => {
    return this._links.get(id);
  });

  // models
  @observable private _links: Map<string, LinkModel> = new Map();
  @observable private _nodes: Map<string, NodeModel> = new Map();

  // control variables
  @observable private _offsetX: number = 0;
  @observable private _offsetY: number = 0;
  @observable private _zoom: number = 100;
  @observable private _gridSize: number = 0;
  @observable private _allowLooseLinks: boolean = false;
  @observable private _allowCanvasTranslation: boolean = true;
  @observable private _allowCanvasZoom: boolean = true;
  @observable private _inverseZoom: boolean = false;
  @observable private _smartRouting: boolean = false;
  @observable private _deleteKeys: number[] = [46, 8];
  @observable private _maxNumberPointsPerLink: number = Infinity;

  fromJSON(object: any, engine: DiagramEngine) {
    super.fromJSON(object, engine);

    this.offsetX = object.offsetX;
    this.offsetY = object.offsetY;
    this.zoom = object.zoom;
    this.gridSize = object.gridSize;

    // fromJSON nodes
    object.nodes = object.nodes || [];
    object.nodes.forEach((node: any) => {
      const nodeOb = engine.getNodeFactory(node.type).getNewInstance(node);
      nodeOb.parent = this;
      nodeOb.fromJSON(node, engine);
      this.addNode(nodeOb);
    });

    // deserialze links
    object.links = object.links || [];
    object.links.forEach((link: any) => {
      const linkOb = engine.getLinkFactory(link.type).getNewInstance();
      linkOb.parent = this;
      linkOb.fromJSON(link, engine);
      this.addLink(linkOb);
    });
  }

  toJSON(): any {
    return _.merge(super.toJSON(), {
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      zoom: this.zoom,
      gridSize: this.gridSize,
      links: Array.from(this._links.values()).map((link) => link.toJSON()),
      nodes: Array.from(this._nodes.values()).map((node) => node.toJSON())
    });
  }

  @action
  clearSelection(ignore: BaseModel<any> | null = null) {
    // tslint:disable-next-line
    console.log('[clearSelection]', this.selectedEntities);
    this.selectedEntities.forEach((item) => {
      if (ignore && ignore.id === item.id) {
        return;
      }
      item.selected = false;
    });
  }

  @action
  addAll(...models: BaseModel[]): BaseModel[] {
    _.forEach(models, (model) => {
      if (model instanceof LinkModel) {
        this.addLink(model);
      } else if (model instanceof NodeModel) {
        this.addNode(model);
      }
    });
    return models;
  }

  @action
  addLink(link: LinkModel): LinkModel {
    link.parent = this;
    this._links.set(link.id, link);
    return link;
  }

  @action
  addNode(node: NodeModel): NodeModel {
    node.parent = this;
    this._nodes.set(node.id, node);
    return node;
  }

  @action
  removeLink(link: LinkModel | string) {
    const l = this._links.get(link instanceof LinkModel ? link.id : link);
    if (l) {
      this._links.delete(l.id);
      // tslint:disable-next-line
      console.log('[diagramModel] remove link', l.id);
    }
  }

  @action
  removeNode(node: NodeModel | string) {
    const n = this._nodes.get(node instanceof NodeModel ? node.id : node);
    if (n) {
      this._nodes.delete(n.id);
    }
  }

  @computed
  get selectedEntities(): Array<BaseModel<any>> {
    return _.uniqBy(
      _.flatten(Array.from(this._nodes.values()).map((node) => node.selectedEntities))
        .concat(_.flatten(Array.from(this._links.values()).map((link) => link.selectedEntities))),
      (item) => `${item.type}:${item.id}`
    );
  }

  /**
   * Getter links
   * @return {Map<string, LinkModel> }
   */
  @computed
  get links(): Map<string, LinkModel> {
    return this._links;
  }

  /**
   * Setter links
   * @param {Map<string, LinkModel> } value
   */
  set links(value: Map<string, LinkModel>) {
    this._links = value;
  }

  /**
   * Getter nodes
   * @return {Map<string, NodeModel> }
   */
  @computed
  get nodes(): Map<string, NodeModel> {
    return this._nodes;
  }

  /**
   * Setter nodes
   * @param {Map<string, NodeModel> } value
   */
  set nodes(value: Map<string, NodeModel>) {
    this._nodes = value;
  }

  /**
   * Getter offsetX
   * @return {number }
   */
  @computed
  get offsetX(): number {
    return this._offsetX;
  }

  /**
   * Setter offsetX
   * @param {number } value
   */
  set offsetX(value: number) {
    this._offsetX = value;
  }

  /**
   * Getter offsetY
   * @return {number }
   */
  @computed
  get offsetY(): number {
    return this._offsetY;
  }

  /**
   * Setter offsetY
   * @param {number } value
   */
  set offsetY(value: number) {
    this._offsetY = value;
  }

  /**
   * Getter zoom
   * @return {number }
   */
  @computed
  get zoom(): number {
    return this._zoom;
  }

  /**
   * Setter zoom
   * @param {number } zoom
   */
  set zoom(zoom: number) {
    this._zoom = zoom;
  }

  /**
   * Getter gridSize
   * @return {number }
   */
  @computed
  get gridSize(): number {
    return this._gridSize;
  }

  /**
   * Setter gridSize
   * @param {number } value
   */
  set gridSize(value: number) {
    this._gridSize = value;
  }

  /**
   * Getter allowLooseLinks
   * @return {boolean }
   */
  @computed
  get allowLooseLinks(): boolean {
    return this._allowLooseLinks;
  }

  /**
   * Setter allowLooseLinks
   * @param {boolean } value
   */
  set allowLooseLinks(value: boolean) {
    this._allowLooseLinks = value;

    // remove loose links if we disallow them
    if (!this._allowLooseLinks) {
      Array.from(this._links.values()).forEach((link) => {
        if (!link.sourcePort || !link.targetPort) {
          link.remove();
        }
      });
    }
  }

  /**
   * Getter allowCanvasTranslation
   * @return {boolean }
   */
  @computed
  get allowCanvasTranslation(): boolean {
    return this._allowCanvasTranslation;
  }

  /**
   * Setter allowCanvasTranslation
   * @param {boolean } value
   */
  set allowCanvasTranslation(value: boolean) {
    this._allowCanvasTranslation = value;
  }

  /**
   * Getter allowCanvasZoom
   * @return {boolean }
   */
  @computed
  get allowCanvasZoom(): boolean {
    return this._allowCanvasZoom;
  }

  /**
   * Setter allowCanvasZoom
   * @param {boolean } value
   */
  set allowCanvasZoom(value: boolean) {
    this._allowCanvasZoom = value;
  }

  /**
   * Getter inverseZoom
   * @return {boolean }
   */
  @computed
  get inverseZoom(): boolean {
    return this._inverseZoom;
  }

  /**
   * Setter inverseZoom
   * @param {boolean } value
   */
  set inverseZoom(value: boolean) {
    this._inverseZoom = value;
  }

  /**
   * Getter maxNumberPointsPerLink
   * @return {number }
   */
  @computed
  get maxNumberPointsPerLink(): number {
    return this._maxNumberPointsPerLink;
  }

  /**
   * Setter maxNumberPointsPerLink
   * @param {number } value
   */
  set maxNumberPointsPerLink(value: number) {
    this._maxNumberPointsPerLink = value;
  }

  /**
   * Getter smartRouting
   * @return {boolean }
   */
  @computed
  get smartRouting(): boolean {
    return this._smartRouting;
  }

  /**
   * Setter smartRouting
   * @param {boolean } value
   */
  set smartRouting(value: boolean) {
    this._smartRouting = value;
  }

  /**
   * Getter deleteKeys
   * @return {number[]}
   */
  @computed
  get deleteKeys(): number[] {
    return this._deleteKeys;
  }

  /**
   * Setter smartRouting
   * @param {number[]} keys
   */
  set deleteKeys(keys: number[]) {
    this._deleteKeys = keys;
  }
}
