import * as React from 'react';

import { AbstractPointFactory } from '../../factories/AbstractPointFactory';
import { DefaultPointModel } from '../models/DefaultPointModel';
import { DefaultPointWidget } from '../widgets/DefaultPointWidget';
import { DiagramEngine } from '../../DiagramEngine';

export class DefaultPointFactory extends AbstractPointFactory<DefaultPointModel> {
  constructor() {
      super('srd-default-point');
  }

  generateReactWidget(_engine: DiagramEngine, point: DefaultPointModel): JSX.Element {
    return <DefaultPointWidget point={point} />;
  }

  getNewInstance(init: any = { x: 0, y: 0 }): DefaultPointModel {
    return new DefaultPointModel(init.x, init.y);
  }
}
