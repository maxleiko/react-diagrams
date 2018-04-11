import { PointModel } from '../models/PointModel';
import { AbstractFactory } from './AbstractFactory';

export abstract class AbstractPointFactory<T extends PointModel = PointModel> extends AbstractFactory<T> {}
