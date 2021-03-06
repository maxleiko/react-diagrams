import * as React from 'react';

import {
  DiagramEngine,
  DefaultNodeModel,
  DiagramWidget,
  DefaultLinkModel,
} from '@leiko/react-diagrams';

export default () => {
  // 1) setup the diagram engine
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  // 3-A) create a default node
  const node1 = new DefaultNodeModel('Node 1', 'rgb(0,192,255)');
  const port1 = node1.addOutPort('Out');
  node1.setPosition(100, 100);

  // 3-B) create another default node
  const node2 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
  const port2 = node2.addInPort('In');
  node2.setPosition(400, 100);

  // link the ports
  const link1 = new DefaultLinkModel();
  link1.connect(port1, port2);
  link1.addLabel('Hello World!');

  // 4) add the models to the root graph
  engine.model.addAll(node1, node2, link1);

  // 6) render the diagram!
  return <DiagramWidget className="srd-demo-canvas" engine={engine} />;
};
