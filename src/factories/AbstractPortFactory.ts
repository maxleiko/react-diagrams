import { PortModel } from '../models/PortModel';
import { AbstractFactory } from './AbstractFactory';
import { AbstractLinkFactory } from './AbstractLinkFactory';

export abstract class AbstractPortFactory<T extends PortModel = PortModel> extends AbstractFactory<T> {
    abstract getLinkFactory(): AbstractLinkFactory;
}
