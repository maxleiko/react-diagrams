import { DiagramEngine } from '../DiagramEngine';
import { LinkModel } from './LinkModel';
import { NodeModel } from './NodeModel';
import { BaseModel } from './BaseModel';
import { PortModel } from './PortModel';
export declare class DiagramModel extends BaseModel {
    getNode: (object: string) => NodeModel<PortModel> | undefined;
    getLink: (object: string) => LinkModel | undefined;
    private _links;
    private _nodes;
    private _offsetX;
    private _offsetY;
    private _zoom;
    private _gridSize;
    private _allowLooseLinks;
    private _allowCanvasTranslation;
    private _allowCanvasZoom;
    private _inverseZoom;
    private _smartRouting;
    private _deleteKeys;
    private _maxNumberPointsPerLink;
    fromJSON(object: any, engine: DiagramEngine): void;
    toJSON(): {
        offsetX: number;
        offsetY: number;
        zoom: number;
        gridSize: number;
        links: {
            sourcePort: string | null;
            sourcePortParent: string | null;
            targetPort: string | null;
            targetPortParent: string | null;
            points: {
                x: number;
                y: number;
                id: string;
                locked: boolean;
                type: string;
                selected: boolean;
                parent: string | null;
            }[];
            labels: {
                id: string;
                locked: boolean;
                type: string;
                selected: boolean;
                parent: string | null;
            }[];
            id: string;
            locked: boolean;
            type: string;
            selected: boolean;
            parent: string | null;
        }[];
        nodes: {
            x: number;
            y: number;
            ports: {
                links: string[];
                maximumLinks: number;
                id: string;
                locked: boolean;
                type: string;
                selected: boolean;
                parent: string | null;
            }[];
            id: string;
            locked: boolean;
            type: string;
            selected: boolean;
            parent: string | null;
        }[];
        id: string;
        locked: boolean;
        type: string;
        selected: boolean;
        parent: string | null;
    };
    delete(): void;
    clearSelection(ignore?: BaseModel<any> | null): void;
    addAll(...models: BaseModel[]): BaseModel[];
    addLink(link: LinkModel): LinkModel;
    addNode(node: NodeModel): NodeModel;
    removeLink(link: LinkModel | string): void;
    removeNode(node: NodeModel | string): void;
    readonly selectedEntities: Array<BaseModel<any>>;
    /**
     * Getter links
     * @return {Map<string, LinkModel> }
     */
    /**
     * Setter links
     * @param {Map<string, LinkModel> } value
     */
    links: Map<string, LinkModel>;
    /**
     * Getter nodes
     * @return {Map<string, NodeModel> }
     */
    /**
     * Setter nodes
     * @param {Map<string, NodeModel> } value
     */
    nodes: Map<string, NodeModel>;
    /**
     * Getter offsetX
     * @return {number }
     */
    /**
     * Setter offsetX
     * @param {number } value
     */
    offsetX: number;
    /**
     * Getter offsetY
     * @return {number }
     */
    /**
     * Setter offsetY
     * @param {number } value
     */
    offsetY: number;
    /**
     * Getter zoom
     * @return {number }
     */
    /**
     * Setter zoom
     * @param {number } zoom
     */
    zoom: number;
    /**
     * Getter gridSize
     * @return {number }
     */
    /**
     * Setter gridSize
     * @param {number } value
     */
    gridSize: number;
    /**
     * Getter allowLooseLinks
     * @return {boolean }
     */
    /**
     * Setter allowLooseLinks
     * @param {boolean } value
     */
    allowLooseLinks: boolean;
    /**
     * Getter allowCanvasTranslation
     * @return {boolean }
     */
    /**
     * Setter allowCanvasTranslation
     * @param {boolean } value
     */
    allowCanvasTranslation: boolean;
    /**
     * Getter allowCanvasZoom
     * @return {boolean }
     */
    /**
     * Setter allowCanvasZoom
     * @param {boolean } value
     */
    allowCanvasZoom: boolean;
    /**
     * Getter inverseZoom
     * @return {boolean }
     */
    /**
     * Setter inverseZoom
     * @param {boolean } value
     */
    inverseZoom: boolean;
    /**
     * Getter maxNumberPointsPerLink
     * @return {number }
     */
    /**
     * Setter maxNumberPointsPerLink
     * @param {number } value
     */
    maxNumberPointsPerLink: number;
    /**
     * Getter smartRouting
     * @return {boolean }
     */
    /**
     * Setter smartRouting
     * @param {boolean } value
     */
    smartRouting: boolean;
    /**
     * Getter deleteKeys
     * @return {number[]}
     */
    /**
     * Setter smartRouting
     * @param {number[]} keys
     */
    deleteKeys: number[];
}
