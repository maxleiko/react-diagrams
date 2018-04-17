/// <reference types="react" />
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
import { PointModel } from './models/PointModel';
import { AbstractPointFactory } from './factories/AbstractPointFactory';
export interface MatrixDimension {
    width: number;
    hAdjustmentFactor: number;
    height: number;
    vAdjustmentFactor: number;
}
/**
 * Passed as prop to the DiagramWidget
 */
export declare class DiagramEngine {
    private _nodeFactories;
    private _linkFactories;
    private _portFactories;
    private _labelFactories;
    private _model;
    private _canvas;
    private _portRefs;
    private _canvasMatrix;
    private _routingMatrix;
    private _hAdjustmentFactor;
    private _vAdjustmentFactor;
    private _action;
    constructor();
    installDefaultFactories(): void;
    canvas: HTMLDivElement | null;
    action: BaseAction | null;
    model: DiagramModel;
    readonly nodeFactories: Map<string, AbstractNodeFactory>;
    readonly linkFactories: Map<string, AbstractLinkFactory>;
    readonly labelFactories: Map<string, AbstractLabelFactory>;
    readonly canvasLeft: number;
    readonly canvasTop: number;
    registerLabelFactory(factory: AbstractLabelFactory): void;
    registerPortFactory(factory: AbstractPortFactory): void;
    registerNodeFactory(factory: AbstractNodeFactory): void;
    registerLinkFactory(factory: AbstractLinkFactory): void;
    getPortFactory(type: string): AbstractPortFactory;
    getNodeFactory(type: string): AbstractNodeFactory;
    getLinkFactory(type: string): AbstractLinkFactory;
    getLabelFactory(type: string): AbstractLabelFactory;
    getFactoryForPort(node: PortModel): AbstractPortFactory;
    getFactoryForNode(node: NodeModel): AbstractNodeFactory;
    getFactoryForLink(link: LinkModel): AbstractLinkFactory;
    getFactoryForLabel(label: LabelModel): AbstractLabelFactory;
    getFactoryForPoint(point: PointModel): AbstractPointFactory;
    generateWidgetForLink(link: LinkModel): JSX.Element;
    generateWidgetForNode(node: NodeModel): JSX.Element;
    generateWidgetForPort(port: PortModel): JSX.Element;
    generateWidgetForPoint(link: LinkModel, point: PointModel): JSX.Element;
    registerPortRef(port: PortModel, ref: HTMLElement): void;
    unregisterPortRef(port: PortModel): void;
    updatePortRefPositions(): void;
    getRelativePoint(x: number, y: number): {
        x: number;
        y: number;
    };
    getRelativeMousePoint(event: React.MouseEvent<Element> | MouseEvent): {
        x: number;
        y: number;
    };
    getPointRelativeToCanvas(x: number, y: number): {
        x: number;
        y: number;
    };
    getNodeElement(node: NodeModel): Element;
    getNodePortElement(port: PortModel): HTMLElement | null;
    /**
     * Calculate rectangular coordinates of the port passed in.
     */
    getPortCoords(port: PortModel): {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
    /**
     * Determine the width and height of the node passed in.
     * It currently assumes nodes have a rectangular shape, can be overriden for customised shapes.
     */
    getNodeDimensions(node: NodeModel): {
        width: number;
        height: number;
    };
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
    readonly canvasMatrix: number[][];
    calculateCanvasMatrix(): void;
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
    readonly routingMatrix: number[][];
    calculateRoutingMatrix(): void;
    /**
     * The routing matrix does not have negative indexes, but elements could be negatively positioned.
     * We use the functions below to translate back and forth between these coordinates, relying on the
     * calculated values of hAdjustmentFactor and vAdjustmentFactor.
     */
    translateRoutingX(x: number, reverse?: boolean): number;
    translateRoutingY(y: number, reverse?: boolean): number;
    /**
     * Despite being a long method, we simply iterate over all three collections (nodes, ports and points)
     * to find the highest X and Y dimensions, so we can build the matrix large enough to contain all elements.
     */
    readonly matrixDimensions: MatrixDimension;
    /**
     * Updates (by reference) where nodes will be drawn on the matrix passed in.
     */
    markNodes: (matrix: number[][]) => void;
    /**
     * Updates (by reference) where ports will be drawn on the matrix passed in.
     */
    markPorts: (matrix: number[][]) => void;
    markMatrixPoint: (matrix: number[][], x: number, y: number) => void;
    /**
     * Tries to reduce zoom level in order to fit every elements in the canvas view
     */
    fitContent(): void;
}
