import { LinkModel } from '../models/LinkModel';
import { PointModel } from '../models/PointModel';
import { AbstractFactory } from './AbstractFactory';
import { DiagramEngine } from '../DiagramEngine';

export abstract class AbstractLinkFactory<
  T extends LinkModel = LinkModel,
  P extends PointModel = PointModel
> extends AbstractFactory<T> {
  abstract generateSegment(engine: DiagramEngine, link: T, key: string | number, svgPath: string): JSX.Element;
  abstract generatePoint(engine: DiagramEngine, point: P): JSX.Element;
}
