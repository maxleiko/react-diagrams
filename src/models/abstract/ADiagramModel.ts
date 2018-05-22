import * as _ from 'lodash';
import { observable, computed, action } from 'mobx';

import { ABaseModel } from './ABaseModel';
import { DiagramModel } from '../DiagramModel';
import { DiagramEngine } from '../../DiagramEngine';
import { LinkModel } from '../LinkModel';
import { NodeModel } from '../NodeModel';
import { BaseModel } from '../BaseModel';
import { ALinkModel } from './ALinkModel';
import { ANodeModel } from './ANodeModel';
import { Toolkit } from '../../Toolkit';

export class ADiagramModel extends ABaseModel implements DiagramModel {
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

  @action
  fromJSON(object: any, engine: DiagramEngine) {
    super.fromJSON(object, engine);

    // load properties
    this._offsetX = object.offsetX;
    this._offsetY = object.offsetY;
    this._zoom = object.zoom;
    this._gridSize = object.gridSize;
    this._allowCanvasTranslation = object.allowCanvasTranslation;
    this._allowCanvasZoom = object.allowCanvasZoom;
    this._allowLooseLinks = object.allowLooseLinks;
    this._inverseZoom = object.inverseZoom;
    this._smartRouting = object.smartRouting;
    this._deleteKeys = object.deleteKeys;
    if (this.maxNumberPointsPerLink === null) {
      this._maxNumberPointsPerLink = Infinity;
    } else {
      this._maxNumberPointsPerLink = object.maxNumberPointsPerLink;
    }

    // load nodes
    object.nodes = object.nodes || [];
    object.nodes.forEach((node: any) => {
      const nodeOb = engine.getNodeFactory(node.type).getNewInstance(node);
      nodeOb.parent = this;
      nodeOb.fromJSON(node, engine);
      this.addNode(nodeOb);
    });

    // load links
    object.links = object.links || [];
    object.links.forEach((link: any) => {
      const linkOb = engine.getLinkFactory(link.type).getNewInstance();
      linkOb.parent = this;
      linkOb.fromJSON(link, engine);
      this.addLink(linkOb);
    });
  }

  toJSON() {
    return {
      ...super.toJSON(),
      offsetX: this._offsetX,
      offsetY: this._offsetY,
      zoom: this._zoom,
      gridSize: this._gridSize,
      allowCanvasTranslation: this._allowCanvasTranslation,
      allowCanvasZoom: this._allowCanvasZoom,
      allowLooseLinks: this._allowLooseLinks,
      inverseZoom: this._inverseZoom,
      smartRouting: this._smartRouting,
      deleteKeys: this._deleteKeys.map((k) => k),
      maxNumberPointsPerLink: this._maxNumberPointsPerLink,
      links: this.links.map((link) => link.toJSON()),
      nodes: this.nodes.map((node) => node.toJSON())
    };
  }

  @action
  delete() {
    this._nodes.clear();
    this._links.clear();
  }

  @action
  clearSelection(ignore: BaseModel<any> | null = null) {
    this.selectedEntities.forEach((item) => {
      if (ignore && ignore.id === item.id) {
        return;
      }
      item.selected = false;
    });
  }

  @action
  addAll(...models: BaseModel[]): BaseModel[] {
    models.forEach((model) => {
      if (model instanceof ALinkModel) {
        this.addLink(model);
      } else if (model instanceof ANodeModel) {
        this.addNode(model);
      }
    });
    return models;
  }

  @action
  addLink(link: LinkModel): LinkModel {
    link.parent = this;
    this._links.set(link.id, link);
    Toolkit.keyUpdater(link, 'id', this._links);
    return link;
  }

  @action
  addNode(node: NodeModel): NodeModel {
    node.parent = this;
    this._nodes.set(node.id, node);
    Toolkit.keyUpdater(node, 'id', this._nodes);
    return node;
  }

  @action
  removeLink(link: LinkModel | string) {
    const l = this._links.get(typeof link === 'string' ? link : link.id);
    if (l) {
      this._links.delete(l.id);
    }
  }

  @action
  removeNode(node: NodeModel | string) {
    const n = this._nodes.get(typeof node === 'string' ? node : node.id);
    if (n) {
      this._nodes.delete(n.id);
    }
  }

  @computed
  get selectedEntities(): Array<BaseModel<any>> {
    return _.uniqBy(
      _.flatten(this.nodes.map((node) => node.selectedEntities))
        .concat(_.flatten(this.links.map((link) => link.selectedEntities))),
      (item) => `${item.type}:${item.id}`
    );
  }

  /**
   * Getter links
   * @return {LinkModel[]}
   */
  @computed
  get links(): LinkModel[] {
    return Array.from(this._links.values());
  }

  @computed
  get linksMap(): Map<string, LinkModel> {
    return this._links;
  }

  /**
   * Getter nodes
   * @return {NodeModel[]}
   */
  @computed
  get nodes(): NodeModel[] {
    return Array.from(this._nodes.values());
  }

  @computed
  get nodesMap(): Map<string, NodeModel> {
    return this._nodes;
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
      this.links.forEach((link) => {
        if (!link.sourcePort || !link.targetPort) {
          link.delete();
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
