import * as React from 'react';
import {
  DiagramEngine,
  DefaultNodeModel,
  DiagramWidget
} from '@leiko/react-diagrams';

// import the custom models
import { DiamondNodeModel } from './DiamondNodeModel';
import { DiamondNodeFactory } from './DiamondNodeFactory';
import { DiamondPortFactory } from './DiamondPortFactory';

/**
 * @Author Dylan Vorster
 */
export default () => {
  // 1) setup the diagram engine
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  // register some other factories as well
  engine.registerPortFactory(new DiamondPortFactory());
  engine.registerNodeFactory(new DiamondNodeFactory());

  // 3-A) create a default node
  const node1 = new DefaultNodeModel('Node 1', 'rgb(0,192,255)');
  node1.addOutPort('Out');
  node1.setPosition(100, 150);

  // 3-B) create our new custom node
  const node2 = new DiamondNodeModel();
  node2.setPosition(250, 108);

  const node3 = new DefaultNodeModel('Node 3', 'red');
  node3.addInPort('In');
  node3.setPosition(500, 150);

  // 4) add the models to the root graph
  engine.model.addAll(node1, node2, node3);

  // 6) render the diagram!
  return <DiagramWidget engine={engine} />;
};
