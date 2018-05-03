import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  DiagramWidget,
  DefaultLinkModel
} from '@leiko/react-diagrams';
import * as React from 'react';

/**
 *
 * Simple stress test of the system, shows that it can handle many nodes, and
 * retain good performance
 *
 * @Author Dylan Vorster
 */
export default () => {
  // 1) setup the diagram engine
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      generateNodes(engine.model, i * 200, j * 100);
    }
  }

  // 6) render the diagram!
  return <DiagramWidget engine={engine} style={{ minHeight: 600 }} />;
};

function generateNodes(model: DiagramModel, offsetX: number, offsetY: number) {
  // 3-A) create a default node
  const node1 = new DefaultNodeModel('Node 1', 'rgb(0,192,255)');
  const port1 = node1.addOutPort('Out');
  node1.setPosition(100 + offsetX, 100 + offsetY);

  // 3-B) create another default node
  const node2 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
  const port2 = node2.addInPort('In');
  node2.setPosition(200 + offsetX, 100 + offsetY);

  // 3-C) link the 2 nodes together
  const link1 = new DefaultLinkModel();
  link1.connect(port1, port2);

  // 4) add the models to the root graph
  model.addAll(node1, node2, link1);
}
