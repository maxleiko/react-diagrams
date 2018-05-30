import * as _ from 'lodash';
import { observable, computed, action } from 'mobx';

import { DefaultLabelFactory } from './defaults/factories/DefaultLabelFactory';
import { DefaultLinkFactory } from './defaults/factories/DefaultLinkFactory';
import { DefaultNodeFactory } from './defaults/factories/DefaultNodeFactory';
import { DefaultPortFactory } from './defaults/factories/DefaultPortFactory';
import { AbstractLabelFactory } from './factories/AbstractLabelFactory';
import { AbstractLinkFactory } from './factories/AbstractLinkFactory';
import { AbstractNodeFactory } from './factories/AbstractNodeFactory';
import { AbstractPortFactory } from './factories/AbstractPortFactory';
import { DiagramModel } from './models/DiagramModel';
import { LabelModel } from './models/LabelModel';
import { LinkModel } from './models/LinkModel';
import { NodeModel } from './models/NodeModel';
import { BaseAction } from './actions/BaseAction';
import { PortModel } from './models/PortModel';
import { ROUTING_SCALING_FACTOR, PathFinding } from './routing/PathFinding';
import { Toolkit } from './Toolkit';
import { PointModel } from './models/PointModel';
import { AbstractPointFactory } from './factories/AbstractPointFactory';
import { DefaultDiagramModel } from './defaults/models/DefaultDiagramModel';
import { BaseModel } from '.';

export interface MatrixDimension {
  width: number;
  hAdjustmentFactor: number;
  height: number;
  vAdjustmentFactor: number;
}

/**
 * Passed as prop to the DiagramWidget
 */
export class DiagramEngine {
  @observable private _nodeFactories: Map<string, AbstractNodeFactory> = new Map();
  @observable private _linkFactories: Map<string, AbstractLinkFactory> = new Map();
  @observable private _portFactories: Map<string, AbstractPortFactory> = new Map();
  @observable private _labelFactories: Map<string, AbstractLabelFactory> = new Map();

  @observable private _model: DiagramModel;
  @observable private _canvas: HTMLDivElement | null = null;
  @observable private _portRefs: Map<string, { port: PortModel, ref: HTMLElement }> = new Map();

  // calculated only when smart routing is active
  @observable private _canvasMatrix: number[][] = [];
  @observable private _routingMatrix: number[][] = [];
  // used when at least one element has negative coordinates
  @observable private _hAdjustmentFactor: number = 0;
  @observable private _vAdjustmentFactor: number = 0;

  @observable private _action: BaseAction | null = null;

  constructor(model: DiagramModel = new DefaultDiagramModel()) {
    this._model = model;

    if (Toolkit.TESTING) {
      Toolkit.TESTING_UID = 0;

      // pop it onto the window so our E2E helpers can find it
      if (window) {
        // tslint:disable-next-line
        (window as any)['diagram_instance'] = this;
      }
    }
  }

  @action
  installDefaultFactories() {
    this.registerNodeFactory(new DefaultNodeFactory());
    this.registerLinkFactory(new DefaultLinkFactory());
    this.registerPortFactory(new DefaultPortFactory());
    this.registerLabelFactory(new DefaultLabelFactory());
  }

  @computed
  get canvas(): HTMLDivElement | null {
    return this._canvas;
  }

  set canvas(canvas: HTMLDivElement | null) {
    this._canvas = canvas;
  }

  @computed
  get action(): BaseAction | null {
    return this._action;
  }

  set action(a: BaseAction | null) {
    this._action = a;
  }

  set model(model: DiagramModel) {
    this._model = model;
  }

  @computed
  get model(): DiagramModel {
    return this._model;
  }

  // !-------------- FACTORIES ------------

  @computed
  get nodeFactories(): AbstractNodeFactory[] {
    return Array.from(this._nodeFactories.values());
  }

  @computed
  get linkFactories(): AbstractLinkFactory[] {
    return Array.from(this._linkFactories.values());
  }

  @computed
  get labelFactories(): AbstractLabelFactory[] {
    return Array.from(this._labelFactories.values());
  }

  @action
  registerLabelFactory(factory: AbstractLabelFactory) {
    this._labelFactories.set(factory.type, factory);
  }

  @action
  registerPortFactory(factory: AbstractPortFactory) {
    this._portFactories.set(factory.type, factory);
  }

  @action
  registerNodeFactory(factory: AbstractNodeFactory) {
    this._nodeFactories.set(factory.type, factory);
  }

  @action
  registerLinkFactory(factory: AbstractLinkFactory) {
    this._linkFactories.set(factory.type, factory);
  }

  getPortFactory(type: string): AbstractPortFactory {
    const factory = this._portFactories.get(type);
    if (factory) {
      return factory;
    }
    throw new Error(`Cannot find factory for port of type: [${type}]`);
  }

  getNodeFactory(type: string): AbstractNodeFactory {
    const factory = this._nodeFactories.get(type);
    if (factory) {
      return factory;
    }
    throw new Error(`Cannot find factory for node of type: [${type}]`);
  }

  getLinkFactory(type: string): AbstractLinkFactory {
    const factory = this._linkFactories.get(type);
    if (factory) {
      return factory;
    }
    throw new Error(`Cannot find factory for link of type: [${type}]`);
  }

  getLabelFactory(type: string): AbstractLabelFactory {
    const factory = this._labelFactories.get(type);
    if (factory) {
      return factory;
    }
    throw new Error(`Cannot find factory for label of type: [${type}]`);
  }

  getFactoryForPort(node: PortModel): AbstractPortFactory {
    return this.getPortFactory(node.type);
  }

  getFactoryForNode(node: NodeModel): AbstractNodeFactory {
    return this.getNodeFactory(node.type);
  }

  getFactoryForLink(link: LinkModel): AbstractLinkFactory {
    return this.getLinkFactory(link.type);
  }

  getFactoryForLabel(label: LabelModel): AbstractLabelFactory {
    return this.getLabelFactory(label.type);
  }

  getFactoryForPoint(point: PointModel): AbstractPointFactory {
    if (point.parent) {
      return this.getLinkFactory(point.parent.type).getPointFactory();
    }
    throw new Error(`PointModel has no parent. Unable to find associated LinkFactory`);
  }

  generateWidgetForLink(link: LinkModel): JSX.Element {
    return this.getFactoryForLink(link).generateReactWidget(this, link);
  }

  generateWidgetForNode(node: NodeModel): JSX.Element {
    return this.getFactoryForNode(node).generateReactWidget(this, node);
  }

  generateWidgetForPort(port: PortModel): JSX.Element {
    return this.getFactoryForPort(port).generateReactWidget(this, port);
  }

  generateWidgetForPoint(link: LinkModel, point: PointModel): JSX.Element {
    return this.getFactoryForLink(link)
      .getPointFactory()
      .generateReactWidget(this, point);
  }

  @action
  registerPortRef(port: PortModel, ref: HTMLElement) {
    this._portRefs.set(port.id, { port, ref });
  }

  @action
  unregisterPortRef(port: PortModel) {
    this._portRefs.delete(port.id);
  }

  @computed
  get portRefs(): Map<string, { port: PortModel, ref: HTMLElement }> {
    return this._portRefs;
  }

  @computed
  get pathFinding(): PathFinding | null {
    if (this._model.smartRouting) {
      return new PathFinding(this);
    }
    return null;
  }

  getRelativePoint(x: number, y: number) {
    const pt = this.getPointRelativeToCanvas(x, y);
    const point = {
      x: (pt.x - this._model.offsetX) / (this._model.zoom / 100.0),
      y: (pt.y - this._model.offsetY) / (this._model.zoom / 100.0)
    };
    return point;
  }

  getRelativeMousePoint(event: React.MouseEvent<Element> | MouseEvent): { x: number; y: number } {
    return this.getRelativePoint(event.clientX, event.clientY);
  }

  getPointRelativeToCanvas(x: number, y: number) {
    if (this._canvas) {
      const rect = this._canvas.getBoundingClientRect();
      return { x: x - rect.left, y: y - rect.top };
    }
    return { x, y };
  }

  /**
   * Gets a model and element under the mouse cursor
   */
  getModelAtPosition(event: MouseEvent): { el: Element; model: BaseModel<any> | undefined } {
    const target = event.target as Element;

    // look for a port
    let element = Toolkit.closest(target, '.srd-port[srd-id]');
    if (element) {
      const nodeElement = Toolkit.closest(target, '.srd-node[srd-id]');
      const nodeId = nodeElement.getAttribute('srd-id');
      const portId = element.getAttribute('srd-id');
      if (nodeId && portId) {
        const node = this._model.nodesMap.get(nodeId);
        if (node) {
          const port = node.portsMap.get(portId);
          if (port) {
            return { el: target, model: port };
          }
        }
      }
    }

    // look for a point
    element = Toolkit.closest(target, '.srd-point[srd-id]');
    if (element) {
      const pointId = element.getAttribute('srd-id');
      const linkId = element.getAttribute('srd-link-id');
      if (pointId && linkId) {
        const link = this._model.linksMap.get(linkId);
        if (link) {
          const point = link.getPointModel(pointId);
          if (point) {
            return { el: target, model: point };
          }
        }
      }
    }

    // look for a label
    element = Toolkit.closest(target, '.srd-label[srd-id]');
    if (element) {
      const labelId = element.getAttribute('srd-id');
      const linkId = element.getAttribute('srd-link-id');
      if (linkId && labelId) {
        const link = this._model.linksMap.get(linkId);
        if (link) {
          const label = link.getLabel(labelId);
          if (label) {
            return { el: target, model: label };
          }
        }
      }
    }

    // look for a link
    element = Toolkit.closest(target, '.srd-link[srd-id]');
    if (element) {
      const linkId = element.getAttribute('srd-id');
      if (linkId) {
        const link = this._model.linksMap.get(linkId);
        if (link) {
          return { el: target, model: link };
        }
      }
    }

    // look for a node
    element = Toolkit.closest(target, '.srd-node[srd-id]');
    if (element) {
      const nodeId = element.getAttribute('srd-id');
      if (nodeId) {
        const node = this._model.nodesMap.get(nodeId);
        if (node) {
          return { el: target, model: node };
        }
      }
    }

    return { el: target, model: undefined };
  }

  /**
   * A representation of the canvas in the following format:
   *
   * +-----------------+
   * | 0 0 0 0 0 0 0 0 |
   * | 0 0 0 0 0 0 0 0 |
   * | 0 0 0 0 0 0 0 0 |
   * | 0 0 0 0 0 0 0 0 |
   * | 0 0 0 0 0 0 0 0 |
   * +-----------------+
   *
   * In which all walkable cells are marked by zeros.
   * It uses @link{#ROUTING_SCALING_FACTOR} to reduce the matrix dimensions and improve performance.
   */
  @computed
  get canvasMatrix(): number[][] {
    return this._canvasMatrix;
  }

  @action
  calculateCanvasMatrix() {
    const { width, hAdjustmentFactor, height, vAdjustmentFactor } = this.matrixDimensions;

    this._hAdjustmentFactor = hAdjustmentFactor;
    this._vAdjustmentFactor = vAdjustmentFactor;

    const matrixWidth = Math.ceil(width / ROUTING_SCALING_FACTOR);
    const matrixHeight = Math.ceil(height / ROUTING_SCALING_FACTOR);

    this._canvasMatrix = new Array(matrixHeight).fill(new Array(matrixWidth).fill(0));
  }

  /**
   * A representation of the canvas in the following format:
   *
   * +-----------------+
   * | 0 0 1 1 0 0 0 0 |
   * | 0 0 1 1 0 0 1 1 |
   * | 0 0 0 0 0 0 1 1 |
   * | 1 1 0 0 0 0 0 0 |
   * | 1 1 0 0 0 0 0 0 |
   * +-----------------+
   *
   * In which all cells blocked by a node (and its ports) are
   * marked as 1; cells where there is nothing (ie, free) receive 0.
   */
  @computed
  get routingMatrix(): number[][] {
    return this._routingMatrix;
  }

  @action
  calculateRoutingMatrix(): void {
    const { width, hAdjustmentFactor, height, vAdjustmentFactor } = this.matrixDimensions;

    this._hAdjustmentFactor = hAdjustmentFactor;
    this._vAdjustmentFactor = vAdjustmentFactor;

    const matrixWidth = Math.ceil(width / ROUTING_SCALING_FACTOR);
    const matrixHeight = Math.ceil(height / ROUTING_SCALING_FACTOR);

    this._routingMatrix = new Array(matrixHeight).fill(new Array(matrixWidth).fill(0));

    // nodes need to be marked as blocked points
    this.markNodes(this._routingMatrix);
    // same thing for ports
    this.markPorts(this._routingMatrix);
  }

  /**
   * The routing matrix does not have negative indexes, but elements could be negatively positioned.
   * We use the functions below to translate back and forth between these coordinates, relying on the
   * calculated values of hAdjustmentFactor and vAdjustmentFactor.
   */
  translateRoutingX(x: number, reverse: boolean = false) {
    return x + this._hAdjustmentFactor * (reverse ? -1 : 1);
  }

  translateRoutingY(y: number, reverse: boolean = false) {
    return y + this._vAdjustmentFactor * (reverse ? -1 : 1);
  }

  /**
   * Despite being a long method, we simply iterate over all three collections (nodes, ports and points)
   * to find the highest X and Y dimensions, so we can build the matrix large enough to contain all elements.
   */
  @computed
  get matrixDimensions(): MatrixDimension {
    const allNodesCoords = this._model.nodes.map(({ x, y, width, height }) => ({ x, y, width, height }));
    const allPortsCoords = _.flatMap(this._model.links.map((link) => [link.sourcePort, link.targetPort]))
      .filter((item: PortModel | null): item is PortModel => item !== null)
      .map(({ x, y, width, height }) => ({ x, y, width, height }));
    const allPointsCoords = _.flatMap(this._model.links.map((link) => link.points))
      .map(({ x, y }) => ({ x, y, width: 0, height: 0 }));
    const all = allNodesCoords.concat(allPortsCoords).concat(allPointsCoords);
    const minX =
      Math.floor(
        Math.min(_.minBy(all, (item) => item.x)!.x, 0) /
          ROUTING_SCALING_FACTOR
      ) * ROUTING_SCALING_FACTOR;
    const maxXElement = _.maxBy(all, (item) => item.x + item.width)!;
    const maxX = Math.max(maxXElement.x + maxXElement.width, this._canvas!.offsetWidth);
    const minY =
      Math.floor(
        Math.min(_.minBy(all, (item) => item.y)!.y, 0) /
          ROUTING_SCALING_FACTOR
      ) * ROUTING_SCALING_FACTOR;
    const maxYElement = _.maxBy(all, (item) => item.y + item.height)!;
    const maxY = Math.max(maxYElement.y + maxYElement.height, this._canvas!.offsetHeight);

    return {
      width: Math.ceil(Math.abs(minX) + maxX),
      height: Math.ceil(Math.abs(minY) + maxY),
      hAdjustmentFactor: Math.abs(minX) / ROUTING_SCALING_FACTOR + 1,
      vAdjustmentFactor: Math.abs(minY) / ROUTING_SCALING_FACTOR + 1
    };
  }

  /**
   * Updates (by reference) where nodes will be drawn on the matrix passed in.
   */
  @action
  markNodes(matrix: number[][]) {
    this._model.nodes.forEach((node) => {
      const startX = Math.floor(node.x / ROUTING_SCALING_FACTOR);
      const endX = Math.ceil((node.x + node.width) / ROUTING_SCALING_FACTOR);
      const startY = Math.floor(node.y / ROUTING_SCALING_FACTOR);
      const endY = Math.ceil((node.y + node.height) / ROUTING_SCALING_FACTOR);

      for (let x = startX - 1; x <= endX + 1; x++) {
        for (let y = startY - 1; y < endY + 1; y++) {
          this.markMatrixPoint(matrix, this.translateRoutingX(x), this.translateRoutingY(y));
        }
      }
    });
  }

  /**
   * Updates (by reference) where ports will be drawn on the matrix passed in.
   */
  @action
  markPorts(matrix: number[][]) {
    _.flatMap(this._model.links.map((link) => [link.sourcePort, link.targetPort]))
      .filter((port: PortModel | null): port is PortModel => port !== null)
      .forEach((port) => {
        const startX = Math.floor(port.x / ROUTING_SCALING_FACTOR);
        const endX = Math.ceil((port.x + port.width) / ROUTING_SCALING_FACTOR);
        const startY = Math.floor(port.y / ROUTING_SCALING_FACTOR);
        const endY = Math.ceil((port.y + port.height) / ROUTING_SCALING_FACTOR);

        for (let x = startX - 1; x <= endX + 1; x++) {
          for (let y = startY - 1; y < endY + 1; y++) {
            this.markMatrixPoint(matrix, this.translateRoutingX(x), this.translateRoutingY(y));
          }
        }
      });
  }

  @action
  markMatrixPoint(matrix: number[][], x: number, y: number) {
    if (matrix.length > y && matrix[y].length > x) {
      matrix[y][x] = 1;
    }
  }

  /**
   * Tries to reduce zoom level in order to fit every elements in the canvas view
   */
  @action
  fitContent() {
    if (this._canvas) {
      const xFactor = this._canvas.clientWidth / this._canvas.scrollWidth;
      const yFactor = this._canvas.clientHeight / this._canvas.scrollHeight;
      const zoomFactor = xFactor < yFactor ? xFactor : yFactor;

      this._model.zoom = this._model.zoom * zoomFactor;
      this._model.offsetX = 0;
      this._model.offsetY = 0;
    }
  }
}
