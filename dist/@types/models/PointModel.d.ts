import { BaseModel } from './BaseModel';
import { LinkModel } from './LinkModel';
import { DiagramEngine } from '../DiagramEngine';
export declare abstract class PointModel<P extends LinkModel = LinkModel> extends BaseModel<P> {
    private _x;
    private _y;
    constructor(type: string | undefined, x: number, y: number);
    isConnectedToPort(): boolean;
    fromJSON(ob: any, engine: DiagramEngine): void;
    toJSON(): {
        x: number;
        y: number;
        id: string;
        locked: boolean;
        type: string;
        selected: boolean;
        parent: string | null;
    };
    delete(): void;
    setPosition(x: number, y: number): void;
    x: number;
    y: number;
}
