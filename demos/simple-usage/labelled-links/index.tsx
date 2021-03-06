import * as React from 'react';
import {
  DiagramEngine,
  DefaultNodeModel,
  DiagramWidget,
  DefaultLinkModel,
} from '@leiko/react-diagrams';

export default () => {
  // setup the diagram engine
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  // create four nodes
  const node1 = new DefaultNodeModel('Node A', 'rgb(0,192,255)');
  const port1 = node1.addOutPort('Out');
  node1.setPosition(100, 100);

  const node2 = new DefaultNodeModel('Node B', 'rgb(255,255,0)');
  const port2 = node2.addInPort('In');
  node2.setPosition(400, 50);

  const node3 = new DefaultNodeModel('Node C (no label)', 'rgb(192,255,255)');
  const port3 = node3.addInPort('In');
  node3.setPosition(450, 180);

  const node4 = new DefaultNodeModel('Node D', 'rgb(192,0,255)');
  const port4 = node4.addInPort('In');
  node4.setPosition(300, 250);

  // link node A and B together and give it a label
  const link1 = new DefaultLinkModel();
  link1.addLabel('Custom label 2');
  link1.connect(port1, port2);

  // no label for A and C, just a link
  const link2 = new DefaultLinkModel();
  link2.connect(port1, port3);

  // also a label for A and D
  const link3 = new DefaultLinkModel();
  link3.addLabel('Emoji label: 🎉');
  link3.connect(port1, port4);

  // add all to the main model
  engine.model.addAll(node1, node2, node3, node4, link1, link2, link3);

  return <DiagramWidget engine={engine} />;
};