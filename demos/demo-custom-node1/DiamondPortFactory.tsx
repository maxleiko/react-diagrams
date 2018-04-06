import * as React from 'react';
import { AbstractPortFactory, DiagramEngine, PortWidget } from 'storm-react-diagrams';
import { DiamondPortModel } from './DiamondPortModel';

export class DiamondPortFactory extends AbstractPortFactory<DiamondPortModel> {

  constructor() {
    super('diamond');
  }

  generateReactWidget(_engine: DiagramEngine, model: DiamondPortModel) {
    return <PortWidget port={model} />;
  }

  getNewInstance(_conf?: any): DiamondPortModel {
    return new DiamondPortModel();
  }
}
