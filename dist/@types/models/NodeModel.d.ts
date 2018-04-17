import { BaseModel } from './BaseModel';
import { PortModel } from './PortModel';
import { DiagramEngine } from '../DiagramEngine';
import { DiagramModel } from './DiagramModel';
export declare abstract class NodeModel<P extends PortModel = PortModel> extends BaseModel<DiagramModel> {
    private _x;
    private _y;
    private _ports;
    private _width;
    private _height;
    constructor(nodeType?: string, id?: string);
    setPosition(x: number, y: number): void;
    readonly selectedEntities: BaseModel[];
    fromJSON(ob: any, engine: DiagramEngine): void;
    toJSON(): {
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
    };
    delete(): void;
    getPortFromID(id: string): P | undefined;
    readonly ports: Map<string, P>;
    width: number;
    height: number;
    x: number;
    y: number;
    removePort(port: PortModel): void;
    addPort(port: P): P;
    updateDimensions({width, height}: {
        width: number;
        height: number;
    }): void;
}
