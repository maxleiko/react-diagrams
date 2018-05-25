import * as React from 'react';
import {
  DiagramEngine,
  DefaultNodeModel,
  DiagramWidget
} from '@leiko/react-diagrams';

import { CustomNodeFactory } from './CustomNodeFactory';

export default () => {
  // 1) setup the diagram engine
  const engine = new DiagramEngine();
  // register custom factory
  engine.registerNodeFactory(new CustomNodeFactory());

  // 3-A) create a default node
  const node1 = new DefaultNodeModel('Custom Node 1', 'rgb(0,192,255)');
  node1.setPosition(100, 150);

  // 3-B) create our new custom node
  const node2 = new DefaultNodeModel('Custom Node 2', 'rgb(192, 168, 0)');
  node2.setPosition(350, 108);

  // 4) add the nodes to the model
  engine.model.addAll(node1, node2);

  // 6) render the diagram!
  return <DiagramWidget engine={engine} />;
};
