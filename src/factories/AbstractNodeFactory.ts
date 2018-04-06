import { NodeModel } from '../models/NodeModel';
import { AbstractFactory } from './AbstractFactory';

export abstract class AbstractNodeFactory<T extends NodeModel = NodeModel> extends AbstractFactory<T> {}
