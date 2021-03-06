import * as React from 'react';
import {
  DiagramEngine,
  DefaultNodeModel,
  DefaultPortModel,
  DiagramWidget
} from '@leiko/react-diagrams';

export default () => {
  // setup the diagram engine
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  // setup the diagram model
  const model = engine.model;
  model.smartRouting = true;
  model.maxNumberPointsPerLink = 0;

  // create four nodes in a way that straight links wouldn't work
  const node1 = new DefaultNodeModel('Node A', 'rgb(0,192,255)');
  const port1 = node1.addPort(new DefaultPortModel(false, 'Out'));
  node1.setPosition(340, 350);
  const node2 = new DefaultNodeModel('Node B', 'rgb(255,255,0)');
  const port2 = node2.addPort(new DefaultPortModel(false, 'Out'));
  node2.setPosition(240, 80);
  const node3 = new DefaultNodeModel('Node C', 'rgb(192,255,255)');
  const port3 = node3.addPort(new DefaultPortModel(true, 'In'));
  node3.setPosition(540, 180);
  const node4 = new DefaultNodeModel('Node D', 'rgb(192,0,255)');
  const port4 = node4.addPort(new DefaultPortModel(true, 'In'));
  node4.setPosition(95, 185);
  const node5 = new DefaultNodeModel('Node E', 'rgb(192,255,0)');
  node5.setPosition(250, 180);

  // linking things together
  const link0 = port1.link(port4);
  const link1 = port2.link(port3);

  // add all to the main model
  model.addAll(node1, node2, node3, node4, node5, link0, link1);

  return <DiagramWidget engine={engine} style={{ minHeight: 500 }} />;
};
