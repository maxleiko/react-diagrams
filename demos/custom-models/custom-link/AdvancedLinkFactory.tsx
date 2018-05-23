import * as React from 'react';
import { DefaultLinkFactory } from '@leiko/react-diagrams';
import { AdvancedLinkModel } from './AdvancedLinkModel';
import { AdvancedLinkSegment } from '.';

export class AdvancedLinkFactory extends DefaultLinkFactory {
  constructor() {
    super('advanced');
  }

  getNewInstance(_initialConfig?: any): AdvancedLinkModel {
    return new AdvancedLinkModel();
  }

  generateLinkSegment(model: AdvancedLinkModel, _selected: boolean, path: string) {
    return (
      <g>
        <AdvancedLinkSegment model={model} path={path} />
      </g>
    );
  }
}
