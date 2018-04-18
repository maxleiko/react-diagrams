import { DiagramEngine, AbstractNodeFactory } from '@leiko/react-diagrams';
import { DiamonNodeWidget } from './DiamondNodeWidget';
import { DiamondNodeModel } from './DiamondNodeModel';
import * as React from 'react';

export class DiamondNodeFactory extends AbstractNodeFactory<DiamondNodeModel> {
  constructor() {
    super('diamond');
  }

  generateReactWidget(engine: DiagramEngine, node: DiamondNodeModel): JSX.Element {
    return <DiamonNodeWidget node={node} engine={engine} />;
  }

  getNewInstance() {
    return new DiamondNodeModel();
  }
}
