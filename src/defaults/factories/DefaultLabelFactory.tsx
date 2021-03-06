import * as React from 'react';
import { DiagramEngine } from '../../DiagramEngine';
import { AbstractLabelFactory } from '../../factories/AbstractLabelFactory';
import { DefaultLabelModel } from '../models/DefaultLabelModel';
import { DefaultLabelWidget } from '../widgets/DefaultLabelWidget';

/**
 * @author Dylan Vorster
 */
export class DefaultLabelFactory extends AbstractLabelFactory<DefaultLabelModel> {
  constructor() {
    super('srd-default-label');
  }

  generateReactWidget(_diagramEngine: DiagramEngine, label: DefaultLabelModel): JSX.Element {
    return <DefaultLabelWidget label={label} />;
  }

  getNewInstance(_initialConfig?: any): DefaultLabelModel {
    return new DefaultLabelModel();
  }
}
