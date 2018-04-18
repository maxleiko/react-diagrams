import { DefaultNodeModel } from '../models/DefaultNodeModel';
import { DiagramEngine } from '../../DiagramEngine';
import { AbstractNodeFactory } from '../../factories/AbstractNodeFactory';
/**
 * @author Dylan Vorster
 */
export declare class DefaultNodeFactory extends AbstractNodeFactory<DefaultNodeModel> {
    constructor();
    generateReactWidget(engine: DiagramEngine, node: DefaultNodeModel): JSX.Element;
    getNewInstance(_initialConfig?: any): DefaultNodeModel;
}
