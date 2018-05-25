import * as React from 'react';
import { DiagramEngine, DefaultNodeFactory, DefaultNodeModel } from '@leiko/react-diagrams';

import { CustomNodeWidget } from './CustomNodeWidget';

export class CustomNodeFactory extends DefaultNodeFactory {

  /**
   * We are using a custom widget to represent the DefaultNodeModel
   * instead of the DefaultNodeWidget
   * @param engine
   * @param node
   */
  generateReactWidget(engine: DiagramEngine, node: DefaultNodeModel): JSX.Element {
    return <CustomNodeWidget node={node} engine={engine} />;
  }
}
