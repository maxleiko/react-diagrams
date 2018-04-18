import { BaseModel } from './BaseModel';
import { LinkModel } from './LinkModel';
export declare abstract class LabelModel extends BaseModel<LinkModel> {
    private _offsetX;
    private _offsetY;
    constructor(type?: string, id?: string);
    offsetX: number;
    offsetY: number;
    delete(): void;
}
