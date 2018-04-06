import * as React from 'react';
import { DefaultNodeModel } from '../models/DefaultNodeModel';
import { DefaultNodeWidget } from '../widgets/DefaultNodeWidget';
import { DiagramEngine } from '../../DiagramEngine';
import { AbstractNodeFactory } from '../../factories/AbstractNodeFactory';
/**
 * @author Dylan Vorster
 */
export class DefaultNodeFactory extends AbstractNodeFactory<DefaultNodeModel> {
  constructor() {
    super('default');
  }

  generateReactWidget(engine: DiagramEngine, node: DefaultNodeModel): JSX.Element {
    return <DefaultNodeWidget node={node} engine={engine} />;
  }

  getNewInstance(_initialConfig?: any): DefaultNodeModel {
    return new DefaultNodeModel();
  }
}
