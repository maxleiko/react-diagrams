/**
 * @author Dylan Vorster
 */
import { LinkModel } from '../../models/LinkModel';
import { DiagramEngine } from '../../DiagramEngine';
import { LabelModel } from '../../models/LabelModel';
import { AbstractPointFactory } from '../../factories/AbstractPointFactory';
export declare class DefaultLinkModel extends LinkModel {
    private _color;
    private _width;
    private _curvyness;
    constructor(ptFactory: AbstractPointFactory, color?: string, width?: number, curvyness?: number);
    toJSON(): {
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
    } & {
        width: number;
        color: string;
        curvyness: number;
    };
    fromJSON(ob: any, engine: DiagramEngine): void;
    addLabel(label: LabelModel | string): void;
    width: number;
    color: string;
    curvyness: number;
}
