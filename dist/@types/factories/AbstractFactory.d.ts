import { BaseModel } from '../models/BaseModel';
import { DiagramEngine } from '../DiagramEngine';
export declare abstract class AbstractFactory<T extends BaseModel> {
    private _type;
    constructor(type: string);
    readonly type: string;
    abstract getNewInstance(initialConfig?: any): T;
    abstract generateReactWidget(diagramEngine: DiagramEngine, model: T): JSX.Element;
}
