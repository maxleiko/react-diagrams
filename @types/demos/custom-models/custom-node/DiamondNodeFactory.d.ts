import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import { DiamondNodeModel } from './DiamondNodeModel';
export declare class DiamondNodeFactory extends AbstractNodeFactory<DiamondNodeModel> {
    constructor();
    generateReactWidget(engine: DiagramEngine, node: DiamondNodeModel): JSX.Element;
    getNewInstance(): DiamondNodeModel;
}
