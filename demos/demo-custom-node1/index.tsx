import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  DiagramWidget
} from 'storm-react-diagrams';
import * as React from 'react';

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

  // 2) setup the diagram model
  const model = new DiagramModel();

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

  // 3-C) link the 2 nodes together
  // const link1 = port1.link(node2.getPortFromID('left')!)!;
  // const link2 = port3.link(node2.getPortFromID('right')!)!;

  // 4) add the models to the root graph
  model.addAll(node1, node2, node3);

  // 5) load model into engine
  engine.model = model;

  // 6) render the diagram!
  return <DiagramWidget className="srd-demo-canvas" engine={engine} />;
};
