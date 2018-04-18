import { PortModel } from '../../models/PortModel';
import { DiagramEngine } from '../../DiagramEngine';
import { DefaultLinkModel } from './DefaultLinkModel';
export declare class DefaultPortModel extends PortModel {
    private _in;
    private _label;
    constructor(isInput: boolean, name: string, label?: string | null);
    fromJSON(object: any, engine: DiagramEngine): void;
    toJSON(): {
        links: string[];
        maximumLinks: number;
        id: string;
        locked: boolean;
        type: string;
        selected: boolean;
        parent: string | null;
    } & {
        in: boolean;
        label: string;
    };
    link(port: DefaultPortModel): DefaultLinkModel;
    canLinkToPort(port: PortModel): boolean;
    readonly in: boolean;
    readonly label: string;
}
