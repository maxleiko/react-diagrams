import * as _ from 'lodash';
import { observable, computed, action } from 'mobx';

import { BaseEntity } from './BaseEntity';
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
import { ROUTING_SCALING_FACTOR } from './routing/PathFinding';
import { Toolkit } from './Toolkit';
import { PointModel } from './models/PointModel';
import { AbstractPointFactory } from './factories/AbstractPointFactory';

/**
 * Passed as prop to the DiagramWidget
 */
export class DiagramEngine extends BaseEntity {
  @observable private _nodeFactories: Map<string, AbstractNodeFactory> = new Map();
  @observable private _linkFactories: Map<string, AbstractLinkFactory> = new Map();
  @observable private _portFactories: Map<string, AbstractPortFactory> = new Map();
  @observable private _labelFactories: Map<string, AbstractLabelFactory> = new Map();

  @observable private _model: DiagramModel = new DiagramModel();
  @observable private _canvas: HTMLDivElement | null = null;

  // calculated only when smart routing is active
  @observable private _canvasMatrix: number[][] = [];
  @observable private _routingMatrix: number[][] = [];
  // used when at least one element has negative coordinates
  @observable private _hAdjustmentFactor: number = 0;
  @observable private _vAdjustmentFactor: number = 0;

  @observable private _action: BaseAction | null = null;

  constructor() {
    super();
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
  get nodeFactories(): Map<string, AbstractNodeFactory> {
    return this._nodeFactories;
  }

  @computed
  get linkFactories(): Map<string, AbstractLinkFactory> {
    return this._linkFactories;
  }

  @computed
  get labelFactories(): Map<string, AbstractLabelFactory> {
    return this._labelFactories;
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

  getRelativeMousePoint(event: React.MouseEvent<Element> | MouseEvent): { x: number; y: number } {
    const point = this.getRelativePoint(event.clientX, event.clientY);
    return {
      x: (point.x - this._model.offsetX) / (this._model.zoom / 100.0),
      y: (point.y - this._model.offsetY) / (this._model.zoom / 100.0)
    };
  }

  getRelativePoint(x: number, y: number) {
    const canvasRect = this._canvas!.getBoundingClientRect();
    return { x: x - canvasRect.left, y: y - canvasRect.top };
  }

  getNodeElement(node: NodeModel): Element {
    const selector = this._canvas!.querySelector(`.srd-node[srd-id="${node.id}"]`);
    if (selector === null) {
      throw new Error('Cannot find Node element with nodeID: [' + node.id + ']');
    }
    return selector;
  }

  getNodePortElement(port: PortModel): HTMLElement | null {
    if (port.parent) {
      const selector = this._canvas!.querySelector<HTMLElement>(
        `.srd-node[srd-id="${port.parent.id}"] .srd-port[srd-id="${port.id}"]`
      );
      if (selector === null) {
        throw new Error(`Cannot find Node Port element with nodeID: [${port.parent.id}] and name: [${port.id}]`);
      }
      return selector;
    }
    return null;
  }

  getPortCenter(port: PortModel): { x: number; y: number } | null {
    const portEl = this.getNodePortElement(port);
    if (portEl) {
      const sourceRect = portEl.getBoundingClientRect();

      const rel = this.getRelativePoint(sourceRect.left, sourceRect.top);

      return {
        x: portEl.offsetWidth / 2 + (rel.x - this._model.offsetX) / (this._model.zoom / 100.0),
        y: portEl.offsetHeight / 2 + (rel.y - this._model.offsetY) / (this._model.zoom / 100.0)
      };
    }
    return null;
  }

  /**
   * Calculate rectangular coordinates of the port passed in.
   */
  getPortCoords(
    port: PortModel
  ): {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null {
    const sourceElement = this.getNodePortElement(port);
    if (sourceElement) {
      const sourceRect = sourceElement.getBoundingClientRect() as DOMRect;
      const canvasRect = this._canvas!.getBoundingClientRect() as ClientRect;

      return {
        x: (sourceRect.x - this._model.offsetX) / (this._model.zoom / 100.0) - canvasRect.left,
        y: (sourceRect.y - this._model.offsetY) / (this._model.zoom / 100.0) - canvasRect.top,
        width: sourceRect.width,
        height: sourceRect.height
      };
    }
    return null;
  }

  /**
   * Determine the width and height of the node passed in.
   * It currently assumes nodes have a rectangular shape, can be overriden for customised shapes.
   */
  getNodeDimensions(node: NodeModel): { width: number; height: number } {
    if (!this._canvas) {
      return {
        width: 0,
        height: 0
      };
    }

    const nodeElement = this.getNodeElement(node);
    const nodeRect = nodeElement.getBoundingClientRect();

    return {
      width: nodeRect.width,
      height: nodeRect.height
    };
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
   * In which all walkable points are marked by zeros.
   * It uses @link{#ROUTING_SCALING_FACTOR} to reduce the matrix dimensions and improve performance.
   */
  getCanvasMatrix(): number[][] {
    if (this._canvasMatrix.length === 0) {
      this.calculateCanvasMatrix();
    }

    return this._canvasMatrix;
  }

  @action
  calculateCanvasMatrix() {
    const {
      width: canvasWidth,
      hAdjustmentFactor,
      height: canvasHeight,
      vAdjustmentFactor
    } = this.calculateMatrixDimensions();

    this._hAdjustmentFactor = hAdjustmentFactor;
    this._vAdjustmentFactor = vAdjustmentFactor;

    const matrixWidth = Math.ceil(canvasWidth / ROUTING_SCALING_FACTOR);
    const matrixHeight = Math.ceil(canvasHeight / ROUTING_SCALING_FACTOR);

    this._canvasMatrix = _.range(0, matrixHeight).map(() => {
      return new Array(matrixWidth).fill(0);
    });
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
   * In which all points blocked by a node (and its ports) are
   * marked as 1; points were there is nothing (ie, free) receive 0.
   */
  getRoutingMatrix(): number[][] {
    if (this._routingMatrix.length === 0) {
      this.calculateRoutingMatrix();
    }

    return this._routingMatrix;
  }

  @action
  calculateRoutingMatrix(): void {
    const matrix = _.cloneDeep(this.getCanvasMatrix());

    // nodes need to be marked as blocked points
    this.markNodes(matrix);
    // same thing for ports
    this.markPorts(matrix);

    this._routingMatrix = matrix;
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
  calculateMatrixDimensions = (): {
    width: number;
    hAdjustmentFactor: number;
    height: number;
    vAdjustmentFactor: number;
  } => {
    const allNodesCoords = Array.from(this._model.nodes.values()).map((item) => ({
      x: item.x,
      width: item.width,
      y: item.y,
      height: item.height
    }));

    const allLinks = Array.from(this._model.links.values());
    const allPortsCoords = _.flatMap(allLinks.map((link) => [link.sourcePort, link.targetPort]))
      .filter(function filter(item: PortModel | null): item is PortModel {
        return item !== null;
      })
      .map((item) => ({
        x: item.x,
        width: item.width,
        y: item.y,
        height: item.height
      }));
    const allPointsCoords = _.flatMap(allLinks.map((link) => link.points)).map((item) => ({
      // points don't have width/height, so let's just use 0
      x: item.x,
      width: 0,
      y: item.y,
      height: 0
    }));

    const minX =
      Math.floor(
        Math.min(_.minBy(_.concat(allNodesCoords, allPortsCoords, allPointsCoords), (item) => item.x)!.x, 0) /
          ROUTING_SCALING_FACTOR
      ) * ROUTING_SCALING_FACTOR;
    const maxXElement = _.maxBy(
      _.concat(allNodesCoords, allPortsCoords, allPointsCoords),
      (item) => item.x + item.width
    )!;
    const maxX = Math.max(maxXElement.x + maxXElement.width, this._canvas!.offsetWidth);

    const minY =
      Math.floor(
        Math.min(_.minBy(_.concat(allNodesCoords, allPortsCoords, allPointsCoords), (item) => item.y)!.y, 0) /
          ROUTING_SCALING_FACTOR
      ) * ROUTING_SCALING_FACTOR;
    const maxYElement = _.maxBy(
      _.concat(allNodesCoords, allPortsCoords, allPointsCoords),
      (item) => item.y + item.height
    )!;
    const maxY = Math.max(maxYElement.y + maxYElement.height, this._canvas!.offsetHeight);

    return {
      width: Math.ceil(Math.abs(minX) + maxX),
      hAdjustmentFactor: Math.abs(minX) / ROUTING_SCALING_FACTOR + 1,
      height: Math.ceil(Math.abs(minY) + maxY),
      vAdjustmentFactor: Math.abs(minY) / ROUTING_SCALING_FACTOR + 1
    };
  }

  /**
   * Updates (by reference) where nodes will be drawn on the matrix passed in.
   */
  markNodes = (matrix: number[][]): void => {
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
  markPorts = (matrix: number[][]): void => {
    const allElements = _.flatMap(
      Array.from(this._model.links.values()).map((link) => [link.sourcePort, link.targetPort])
    );
    allElements
      .filter(function filter(port: PortModel | null): port is PortModel {
        return port !== null;
      })
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

  markMatrixPoint = (matrix: number[][], x: number, y: number) => {
    if (matrix[y] !== undefined && matrix[y][x] !== undefined) {
      matrix[y][x] = 1;
    }
  }

  @action
  zoomToFit() {
    const xFactor = this._canvas!.clientWidth / this._canvas!.scrollWidth;
    const yFactor = this._canvas!.clientHeight / this._canvas!.scrollHeight;
    const zoomFactor = xFactor < yFactor ? xFactor : yFactor;

    this._model.zoom = this._model.zoom * zoomFactor;
    this._model.offsetX = 0;
    this._model.offsetY = 0;
  }
}
