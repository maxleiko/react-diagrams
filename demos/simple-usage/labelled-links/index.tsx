import * as React from 'react';
import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  DiagramWidget,
  DefaultLinkModel,
  DefaultPointFactory
} from 'storm-react-diagrams';
// @ts-ignore
import { action } from '@storybook/addon-actions';
import { DemoWorkspace } from '../../DemoWorkspace';

export default () => {
  // setup the diagram engine
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  // setup the diagram model
  const model = new DiagramModel();

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

  const ptFactory = new DefaultPointFactory();

  // link node A and B together and give it a label
  const link1 = new DefaultLinkModel(ptFactory);
  link1.addLabel('Custom label 2');
  link1.connect(port1, port2);

  // no label for A and C, just a link
  const link2 = new DefaultLinkModel(ptFactory);
  link2.connect(port1, port3);

  // also a label for A and D
  const link3 = new DefaultLinkModel(ptFactory);
  link3.addLabel('Emoji label: 🎉');
  link3.connect(port1, port4);

  // add all to the main model
  model.addAll(node1, node2, node3, node4, link1, link2, link3);

  // load model into engine and render
  engine.model = model;

  const Header = () => (
    <button onClick={() => action('Serialized Graph')(JSON.stringify(model, null, 2))}>
      Serialize Graph
    </button>
  );

  return (
    <DemoWorkspace header={<Header />}>
      <DiagramWidget engine={engine} />
    </DemoWorkspace>
  );
};