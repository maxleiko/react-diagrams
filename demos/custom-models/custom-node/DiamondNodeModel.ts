import { ANodeModel } from '@leiko/react-diagrams';
import { DiamondPortModel } from './DiamondPortModel';
import { createTransformer } from 'mobx-utils';

export class DiamondNodeModel extends ANodeModel<DiamondPortModel> {

  getPort = createTransformer((id: string): DiamondPortModel | undefined => this.portsMap.get(id));

  constructor() {
    super('diamond');
    this.addPort(new DiamondPortModel('top'));
    this.addPort(new DiamondPortModel('left'));
    this.addPort(new DiamondPortModel('bottom'));
    this.addPort(new DiamondPortModel('right'));
  }
}
