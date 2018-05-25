import * as React from 'react';
import { DefaultLinkFactory, DefaultLinkModel, DiagramEngine } from '@leiko/react-diagrams';

import { CustomSegmentWidget } from './CustomSegmentWidget';

export class CustomLinkFactory extends DefaultLinkFactory {

  generateSegment(_engine: DiagramEngine, link: DefaultLinkModel, key: number, svgPath: string) {
    return (
      <g key={`segment-${key}`} srd-index={key}>
        <CustomSegmentWidget path={svgPath} model={link} />
      </g>
    );
  }

  getNewInstance(_initialConfig?: any): DefaultLinkModel {
    const link = new DefaultLinkModel('rgba(200, 20, 20, 0.5)', 7, 100);
    console.log('Create new Link instance', link.toJSON());
    return link;
  }
}
