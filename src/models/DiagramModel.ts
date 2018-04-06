import { BaseListener, BaseEntity, BaseEvent, BaseEntityType } from '../BaseEntity';
import * as _ from 'lodash';
import { DiagramEngine } from '../DiagramEngine';
import { LinkModel } from './LinkModel';
import { NodeModel } from './NodeModel';
import { PortModel } from './PortModel';
import { BaseModel, BaseModelListener } from './BaseModel';
import { PointModel } from './PointModel';

export interface NodeEvent<T extends NodeModel = NodeModel> extends BaseEvent<DiagramModel> {
  node: T;
  isCreated?: boolean;
}

export interface LinkEvent<T extends LinkModel = LinkModel> extends BaseEvent<DiagramModel> {
  link: T;
  isCreated?: boolean;
}

export interface OffsetEvent extends BaseEvent<DiagramModel> {
  offsetX: number;
  offsetY: number;
}

export interface ZoomEvent extends BaseEvent<DiagramModel> {
  zoom: number;
}

export interface GridEvent extends BaseEvent<DiagramModel> {
  size: number;
}

/**
 * @author Dylan Vorster
 *
 */
export interface DiagramListener<N extends NodeModel = NodeModel, L extends LinkModel = LinkModel>
  extends BaseListener {
  nodesUpdated?(event: NodeEvent<N>): void;
  linksUpdated?(event: LinkEvent<L>): void;
  offsetUpdated?(event: OffsetEvent): void;
  zoomUpdated?(event: ZoomEvent): void;
  gridUpdated?(event: GridEvent): void;
}

/**
 *
 */
export class DiagramModel extends BaseEntity<DiagramListener> {
  // models
  private _links: Map<string, LinkModel> = new Map();
  private _nodes: Map<string, NodeModel> = new Map();

  // control variables
  private _offsetX: number = 0;
  private _offsetY: number = 0;
  private _zoom: number = 100;
  private _rendered: boolean = false;
  private _gridSize: number = 0;

  /**
   * Getter links
   * @return {Map<string, LinkModel> }
   */
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
  get offsetX(): number {
    return this._offsetX;
  }

  /**
   * Setter offsetX
   * @param {number } value
   */
  set offsetX(value: number) {
    this._offsetX = value;
    this.iterateListeners((listener, event) => {
      if (listener.offsetUpdated) {
        listener.offsetUpdated({ ...event, offsetX: this.offsetX, offsetY: this.offsetY });
      }
    });
  }

  /**
   * Getter offsetY
   * @return {number }
   */
  get offsetY(): number {
    return this._offsetY;
  }

  /**
   * Setter offsetY
   * @param {number } value
   */
  set offsetY(value: number) {
    this._offsetY = value;
    this.iterateListeners((listener, event) => {
      if (listener.offsetUpdated) {
        listener.offsetUpdated({ ...event, offsetX: this.offsetX, offsetY: this.offsetY });
      }
    });
  }

  /**
   * Getter zoom
   * @return {number }
   */
  get zoom(): number {
    return this._zoom;
  }

  /**
   * Setter zoom
   * @param {number } zoom
   */
  set zoom(zoom: number) {
    this._zoom = zoom;
    this.iterateListeners((listener, event) => {
      if (listener.zoomUpdated) {
        listener.zoomUpdated({ ...event, zoom });
      }
    });
  }

  /**
   * Getter rendered
   * @return {boolean }
   */
  get rendered(): boolean {
    return this._rendered;
  }

  /**
   * Setter rendered
   * @param {boolean } value
   */
  set rendered(value: boolean) {
    this._rendered = value;
  }

  /**
   * Getter gridSize
   * @return {number }
   */
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

  setGridSize(size: number = 0) {
    this.gridSize = size;
    this.iterateListeners((listener, event) => {
      if (listener.gridUpdated) {
        listener.gridUpdated({ ...event, size });
      }
    });
  }

  getGridPosition(pos: number) {
    if (this.gridSize === 0) {
      return pos;
    }
    return this.gridSize * Math.floor((pos + this.gridSize / 2) / this.gridSize);
  }

  deSerializeDiagram(object: any, diagramEngine: DiagramEngine) {
    this.deSerialize(object, diagramEngine);

    this.offsetX = object.offsetX;
    this.offsetY = object.offsetY;
    this.zoom = object.zoom;
    this.gridSize = object.gridSize;

    // deserialize nodes
    _.forEach(object.nodes, (node: any) => {
      const nodeOb = diagramEngine.getNodeFactory(node.type).getNewInstance(node);
      nodeOb.parent = this;
      nodeOb.deSerialize(node, diagramEngine);
      this.addNode(nodeOb);
    });

    // deserialze links
    _.forEach(object.links, (link: any) => {
      const linkOb = diagramEngine.getLinkFactory(link.type).getNewInstance();
      linkOb.parent = this;
      linkOb.deSerialize(link, diagramEngine);
      this.addLink(linkOb);
    });
  }

  serializeDiagram() {
    return _.merge(this.serialize(), {
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      zoom: this.zoom,
      gridSize: this.gridSize,
      links: Array.from(this._links.values()).map((link) => link.serialize()),
      nodes: Array.from(this._nodes.values()).map((node) => node.serialize())
    });
  }

  clearSelection(ignore: BaseModel<BaseEntity, BaseModelListener> | null = null) {
    _.forEach(this.getSelectedItems(), (element) => {
      if (ignore && ignore.id === element.id) {
        return;
      }
      element.selected = false; // TODO dont fire the listener
    });
  }

  getSelectedItems(...filters: BaseEntityType[]): Array<BaseModel<BaseEntity, BaseModelListener>> {
    if (!Array.isArray(filters)) {
      filters = [filters];
    }
    let items: Array<BaseModel<any, any>> = [];

    // find all nodes
    items = items.concat(
      _.flatten(Array.from(this._nodes.values()).map((node) => node.getSelectedEntities()))
    );

    // find all links
    items = items.concat(
      _.flatten(Array.from(this._links.values()).map((link) => link.getSelectedEntities()))
    );

    items = _.uniq(items);

    if (filters.length > 0) {
      items = _.filter(items, (item: BaseModel<any>) => {
        if (_.includes(filters, 'node') && item instanceof NodeModel) {
          return true;
        }
        if (_.includes(filters, 'link') && item instanceof LinkModel) {
          return true;
        }
        if (_.includes(filters, 'port') && item instanceof PortModel) {
          return true;
        }
        if (_.includes(filters, 'point') && item instanceof PointModel) {
          return true;
        }
        return false;
      });
    }

    return items;
  }

  setOffset(offsetX: number, offsetY: number) {
    this._offsetX = offsetX;
    this._offsetY = offsetY;
    this.iterateListeners((listener, event) => {
      if (listener.offsetUpdated) {
        listener.offsetUpdated({ ...event, offsetX, offsetY });
      }
    });
  }

  getNode(id: string): NodeModel | undefined {
    return this._nodes.get(id);
  }

  getLink(id: string): LinkModel | undefined {
    return this._links.get(id);
  }

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

  addLink(link: LinkModel): LinkModel {
    link.addListener({
      entityRemoved: () => {
        this.removeLink(link);
      }
    });
    this._links.set(link.id, link);
    this.iterateListeners((listener, event) => {
      if (listener.linksUpdated) {
        listener.linksUpdated({ ...event, link, isCreated: true });
      }
    });
    return link;
  }

  connectLink(link: LinkModel): LinkModel {
    this.iterateListeners((listener, event) => {
      if (listener.linksUpdated) {
        listener.linksUpdated({ ...event, link });
      }
    });
    return link;
  }

  addNode(node: NodeModel): NodeModel {
    node.addListener({
      entityRemoved: () => {
        this.removeNode(node);
      }
    });
    this._nodes.set(node.id, node);
    this.iterateListeners((listener, event) => {
      if (listener.nodesUpdated) {
        listener.nodesUpdated({ ...event, node, isCreated: true });
      }
    });
    return node;
  }

  removeLink(link: LinkModel | string) {
    const l = this._links.get(link instanceof LinkModel ? link.id : link);
    if (l) {
      this._links.delete(l.id);
      this.iterateListeners((listener, event) => {
        if (listener.linksUpdated) {
          listener.linksUpdated({ ...event, link: l, isCreated: false });
        }
      });
    }
  }

  removeNode(node: NodeModel | string) {
    const n = this._nodes.get(node instanceof NodeModel ? node.id : node);
    if (n) {
      this._nodes.delete(n.id);
      this.iterateListeners((listener, event) => {
        if (listener.nodesUpdated) {
          listener.nodesUpdated({ ...event, node: n, isCreated: false });
        }
      });
    }
  }
}
