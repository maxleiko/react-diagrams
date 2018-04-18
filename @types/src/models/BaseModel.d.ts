import { DiagramEngine } from '../DiagramEngine';
/**
 * @author Dylan Vorster
 */
export declare abstract class BaseModel<P extends BaseModel = any> {
    private _id;
    private _type;
    private _locked;
    private _selected;
    private _parent;
    constructor(type?: string, id?: string);
    abstract delete(): void;
    /**
     * Getter id
     * @return {string}
     */
    /**
     * Setter id
     * @param {string} value
     */
    id: string;
    /**
     * Setter locked
     * @param {boolean } value
     */
    locked: boolean;
    parent: P | null;
    readonly selectedEntities: BaseModel[];
    fromJSON(ob: any, _engine: DiagramEngine): void;
    toJSON(): {
        id: string;
        locked: boolean;
        type: string;
        selected: boolean;
        parent: string | null;
    };
    readonly type: string;
    selected: boolean;
}
