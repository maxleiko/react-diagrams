import * as React from 'react';
import { DiagramEngine, DefaultNodeModel, DiagramWidget } from '@leiko/react-diagrams';
import { DemoWorkspace } from '../../DemoWorkspace';

// @ts-ignore
import { action } from '@storybook/addon-actions';

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

  // 3-C) link the 2 nodes together
  const link1 = port1.link(port2)!;

  // 4) add the models to the root graph
  engine.model.addAll(node1, node2, link1);

  const Header = () => (
    <button onClick={() => action('Serialized Graph')(JSON.stringify(engine.model, null, 2))}>
      Serialize Graph
    </button>
  );

  return (
    <DemoWorkspace header={<Header />}>
      <DiagramWidget engine={engine} />
    </DemoWorkspace>
  );
};
