import * as React from 'react';
import {
  DiagramEngine,
  DefaultNodeModel,
  DiagramWidget,
  DiagramModel
} from '@leiko/react-diagrams';
import { DemoWorkspace } from '../../DemoWorkspace';

/**
 *
 * Simple stress test of the system plus zoom to fit function
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
  return (
    <DemoWorkspace header={<button onClick={() => engine.fitContent()}>Fit content</button>}>
      <DiagramWidget engine={engine} style={{ minHeight: 600 }} />
    </DemoWorkspace>
  );
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
  const link1 = port1.link(port2)!;

  // 4) add the models to the root graph
  model.addAll(node1, node2, link1);
}
