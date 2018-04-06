import { LinkModel } from '../models/LinkModel';
import { AbstractFactory } from './AbstractFactory';

export abstract class AbstractLinkFactory<T extends LinkModel = LinkModel> extends AbstractFactory<T> {
  abstract generateLinkSegment(model: T, selected: boolean, path: string): JSX.Element;
}
