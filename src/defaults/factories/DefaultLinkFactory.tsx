import * as React from 'react';
import { DefaultLinkWidget } from '../widgets/DefaultLinkWidget';
import { DiagramEngine } from '../../DiagramEngine';
import { AbstractLinkFactory } from '../../factories/AbstractLinkFactory';
import { DefaultLinkModel } from '../models/DefaultLinkModel';

/**
 * @author Dylan Vorster
 */
export class DefaultLinkFactory extends AbstractLinkFactory<DefaultLinkModel> {
  constructor() {
    super('default');
  }

  generateReactWidget(diagramEngine: DiagramEngine, link: DefaultLinkModel): JSX.Element {
    return React.createElement(DefaultLinkWidget, {
      link,
      diagramEngine
    });
  }

  getNewInstance(_initialConfig?: any): DefaultLinkModel {
    return new DefaultLinkModel();
  }

  generateLinkSegment(model: DefaultLinkModel, _widget: DefaultLinkWidget, selected: boolean, path: string) {
    return (
      <path
        className={selected ? '--path-selected' : ''}
        strokeWidth={model.width}
        stroke={model.color}
        d={path}
      />
    );
  }
}
