import { BaseModel } from './BaseModel';
import { NodeModel } from './NodeModel';
import { LinkModel } from './LinkModel';
import { DiagramEngine } from '../DiagramEngine';
export declare abstract class PortModel extends BaseModel<NodeModel> {
    private _maximumLinks;
    private _links;
    private _x;
    private _y;
    private _width;
    private _height;
    constructor(name: string, type?: string, maximumLinks?: number);
    readonly selectedEntities: BaseModel[];
    fromJSON(ob: any, engine: DiagramEngine): void;
    toJSON(): {
        links: string[];
        maximumLinks: number;
        id: string;
        locked: boolean;
        type: string;
        selected: boolean;
        parent: string | null;
    };
    canCreateLink(): boolean;
    removeLink(link: LinkModel): boolean;
    delete(): void;
    addLink(link: LinkModel): void;
    setPosition(x: number, y: number): void;
    canLinkToPort(_port: PortModel): boolean;
    readonly maximumLinks: number;
    readonly links: Map<string, LinkModel>;
    readonly connected: boolean;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}
