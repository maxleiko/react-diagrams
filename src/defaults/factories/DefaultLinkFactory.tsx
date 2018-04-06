import * as React from 'react';
import * as cx from 'classnames';
import { DefaultLinkWidget } from '../widgets/DefaultLinkWidget';
import { DiagramEngine } from '../../DiagramEngine';
import { AbstractLinkFactory } from '../../factories/AbstractLinkFactory';
import { DefaultLinkModel } from '../models/DefaultLinkModel';
import { DefaultPortModel } from 'storm-react-diagrams';

/**
 * @author Dylan Vorster
 */
export class DefaultLinkFactory extends AbstractLinkFactory<DefaultLinkModel> {
  constructor(type: string = 'default') {
    super(type);
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

  generateLinkSegment(model: DefaultLinkModel, selected: boolean, path: string) {
    let reverse = false;
    if (model.sourcePort && model.sourcePort instanceof DefaultPortModel) {
      reverse = model.sourcePort.in;
    }
    return (
      <path
        className={cx('srd-default-link', { selected, reverse })}
        strokeWidth={model.width}
        stroke={model.color}
        d={path}
      />
    );
  }
}
