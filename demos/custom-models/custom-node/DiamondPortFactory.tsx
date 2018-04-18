import * as React from 'react';
import { AbstractPortFactory, DiagramEngine, PortWidgetContainer, DefaultLinkFactory } from '@leiko/react-diagrams';
import { DiamondPortModel } from './DiamondPortModel';

export class DiamondPortFactory extends AbstractPortFactory<DiamondPortModel> {

  constructor() {
    super('diamond');
  }

  generateReactWidget(engine: DiagramEngine, model: DiamondPortModel) {
    return <PortWidgetContainer engine={engine} port={model} />;
  }

  getNewInstance(_conf?: any): DiamondPortModel {
    return new DiamondPortModel();
  }

  getLinkFactory(): DefaultLinkFactory {
    return new DefaultLinkFactory();
  }
}
