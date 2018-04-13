import * as React from 'react';
import { DefaultPortModel } from '../models/DefaultPortModel';
import { AbstractPortFactory } from '../../factories/AbstractPortFactory';
import { AbstractLinkFactory } from '../../factories/AbstractLinkFactory';
import { DefaultLinkFactory } from '../factories/DefaultLinkFactory';
import { DiagramEngine } from '../../DiagramEngine';
import { DefaultPortWidget } from '../../defaults/widgets/DefaultPortWidget';

export class DefaultPortFactory extends AbstractPortFactory<DefaultPortModel> {
  constructor() {
    super('srd-default-port');
  }

  generateReactWidget(engine: DiagramEngine, port: DefaultPortModel) {
    return <DefaultPortWidget engine={engine} port={port} />;
  }

  getNewInstance(_initialConfig?: any): DefaultPortModel {
    return new DefaultPortModel(true, 'unknown');
  }

  getLinkFactory(): AbstractLinkFactory {
    return new DefaultLinkFactory();
  }
}
