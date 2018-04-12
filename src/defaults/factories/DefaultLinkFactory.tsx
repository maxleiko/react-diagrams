import * as React from 'react';
import { DefaultLinkWidget } from '../widgets/DefaultLinkWidget';
import { DiagramEngine } from '../../DiagramEngine';
import { AbstractLinkFactory } from '../../factories/AbstractLinkFactory';
import { DefaultLinkModel } from '../models/DefaultLinkModel';
import { DefaultPointFactory } from './DefaultPointFactory';

/**
 * @author Dylan Vorster
 */
export class DefaultLinkFactory extends AbstractLinkFactory<DefaultLinkModel> {
  constructor(type: string = 'srd-default-link') {
    super(type);
  }

  generateReactWidget(engine: DiagramEngine, link: DefaultLinkModel): JSX.Element {
    return <DefaultLinkWidget engine={engine} link={link} />;
  }

  generateSegment(_engine: DiagramEngine, link: DefaultLinkModel, key: number, svgPath: string) {
    return (
      <g key={key} className="srd-segment">
        <path
          className="halo"
          strokeWidth={20}
          stroke={link.color}
          d={svgPath}
        />
        <path
          className="path"
          strokeWidth={link.width}
          stroke={link.color}
          d={svgPath}
        />
      </g>
    );
  }

  getNewInstance(_initialConfig?: any): DefaultLinkModel {
    return new DefaultLinkModel(this.getPointFactory());
  }

  getPointFactory(): DefaultPointFactory {
    return new DefaultPointFactory();
  }
}
