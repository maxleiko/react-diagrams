import { DefaultPortModel } from '../models/DefaultPortModel';
import { AbstractPortFactory } from '../../factories/AbstractPortFactory';

export class DefaultPortFactory extends AbstractPortFactory<DefaultPortModel> {
  constructor() {
    super('default');
  }

  getNewInstance(_initialConfig?: any): DefaultPortModel {
    return new DefaultPortModel(true, 'unknown');
  }
}
