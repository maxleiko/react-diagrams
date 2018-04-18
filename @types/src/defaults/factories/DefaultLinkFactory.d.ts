import { DiagramEngine } from '../../DiagramEngine';
import { AbstractLinkFactory } from '../../factories/AbstractLinkFactory';
import { DefaultLinkModel } from '../models/DefaultLinkModel';
import { DefaultPointFactory } from './DefaultPointFactory';
/**
 * @author Dylan Vorster
 */
export declare class DefaultLinkFactory extends AbstractLinkFactory<DefaultLinkModel> {
    constructor(type?: string);
    generateReactWidget(engine: DiagramEngine, link: DefaultLinkModel): JSX.Element;
    generateSegment(_engine: DiagramEngine, link: DefaultLinkModel, key: number, svgPath: string): JSX.Element;
    getNewInstance(_initialConfig?: any): DefaultLinkModel;
    getPointFactory(): DefaultPointFactory;
}
