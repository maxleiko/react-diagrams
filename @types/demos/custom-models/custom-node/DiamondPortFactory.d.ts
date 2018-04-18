import { AbstractPortFactory, DiagramEngine, DefaultLinkFactory } from 'storm-react-diagrams';
import { DiamondPortModel } from './DiamondPortModel';
export declare class DiamondPortFactory extends AbstractPortFactory<DiamondPortModel> {
    constructor();
    generateReactWidget(engine: DiagramEngine, model: DiamondPortModel): JSX.Element;
    getNewInstance(_conf?: any): DiamondPortModel;
    getLinkFactory(): DefaultLinkFactory;
}
