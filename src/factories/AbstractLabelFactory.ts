import { LabelModel } from '../models/LabelModel';
import { AbstractFactory } from './AbstractFactory';

export abstract class AbstractLabelFactory<T extends LabelModel = LabelModel> extends AbstractFactory<T> {}
