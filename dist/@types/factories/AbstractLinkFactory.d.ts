import { LinkModel } from '../models/LinkModel';
import { AbstractFactory } from './AbstractFactory';
import { DiagramEngine } from '../DiagramEngine';
import { AbstractPointFactory } from './AbstractPointFactory';
export declare abstract class AbstractLinkFactory<T extends LinkModel = LinkModel> extends AbstractFactory<T> {
    abstract generateSegment(engine: DiagramEngine, link: T, key: string | number, svgPath: string): JSX.Element;
    abstract getPointFactory(): AbstractPointFactory;
}
