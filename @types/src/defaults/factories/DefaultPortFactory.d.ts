import { DefaultPortModel } from '../models/DefaultPortModel';
import { AbstractPortFactory } from '../../factories/AbstractPortFactory';
import { AbstractLinkFactory } from '../../factories/AbstractLinkFactory';
import { DiagramEngine } from '../../DiagramEngine';
export declare class DefaultPortFactory extends AbstractPortFactory<DefaultPortModel> {
    constructor();
    generateReactWidget(engine: DiagramEngine, port: DefaultPortModel): JSX.Element;
    getNewInstance(_initialConfig?: any): DefaultPortModel;
    getLinkFactory(): AbstractLinkFactory;
}
