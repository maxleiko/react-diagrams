import { DefaultPortModel } from './DefaultPortModel';
import { NodeModel } from '../../models/NodeModel';
import { DiagramEngine } from '../../DiagramEngine';
/**
 * @author Dylan Vorster
 */
export declare class DefaultNodeModel extends NodeModel<DefaultPortModel> {
    private _name;
    private _color;
    constructor(name?: string, color?: string);
    /**
     * Getter name
     * @return {string}
     */
    /**
     * Setter name
     * @param {string} value
     */
    name: string;
    /**
     * Getter color
     * @return {string}
     */
    /**
     * Setter color
     * @param {string} value
     */
    color: string;
    addInPort(label: string): DefaultPortModel;
    addOutPort(label: string): DefaultPortModel;
    fromJSON(object: any, engine: DiagramEngine): void;
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
    } & {
        name: string;
        color: string;
    };
    readonly inputs: DefaultPortModel[];
    readonly outputs: DefaultPortModel[];
}
