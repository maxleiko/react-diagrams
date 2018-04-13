import * as React from 'react';
import { AbstractPortFactory, DiagramEngine, PortWidgetContainer, DefaultLinkFactory } from 'storm-react-diagrams';
import { DiamondPortModel } from './DiamondPortModel';

export class DiamondPortFactory extends AbstractPortFactory<DiamondPortModel> {

  constructor() {
    super('diamond');
  }

  generateReactWidget(_engine: DiagramEngine, model: DiamondPortModel) {
    return <PortWidgetContainer port={model} />;
  }

  getNewInstance(_conf?: any): DiamondPortModel {
    return new DiamondPortModel();
  }

  getLinkFactory(): DefaultLinkFactory {
    return new DefaultLinkFactory();
  }
}
