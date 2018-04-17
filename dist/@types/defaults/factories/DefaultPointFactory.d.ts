import { AbstractPointFactory } from '../../factories/AbstractPointFactory';
import { DefaultPointModel } from '../models/DefaultPointModel';
import { DiagramEngine } from '../../DiagramEngine';
export declare class DefaultPointFactory extends AbstractPointFactory<DefaultPointModel> {
    constructor();
    generateReactWidget(_engine: DiagramEngine, point: DefaultPointModel): JSX.Element;
    getNewInstance(init?: any): DefaultPointModel;
}
