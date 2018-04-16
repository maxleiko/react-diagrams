import * as React from 'react';
import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  DefaultPortModel,
  DiagramWidget
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
  model.smartRouting = true;
  model.maxNumberPointsPerLink = 0;

  // create four nodes in a way that straight links wouldn't work
  const node1 = new DefaultNodeModel('Node A', 'rgb(0,192,255)');
  const port1 = node1.addPort(new DefaultPortModel(false, 'out-1', 'Out'));
  node1.setPosition(340, 350);

  const node2 = new DefaultNodeModel('Node B', 'rgb(255,255,0)');
  const port2 = node2.addPort(new DefaultPortModel(false, 'out-1', 'Out'));
  node2.setPosition(240, 80);
  const node3 = new DefaultNodeModel('Node C', 'rgb(192,255,255)');
  const port3 = node3.addPort(new DefaultPortModel(true, 'in-1', 'In'));
  node3.setPosition(540, 180);
  const node4 = new DefaultNodeModel('Node D', 'rgb(192,0,255)');
  const port4 = node4.addPort(new DefaultPortModel(true, 'in-1', 'In'));
  node4.setPosition(95, 185);
  const node5 = new DefaultNodeModel('Node E', 'rgb(192,255,0)');
  node5.setPosition(250, 180);

  // linking things together
  const link1 = port1.link(port4)!;
  const link2 = port2.link(port3)!;

  // add all to the main model
  model.addAll(node1, node2, node3, node4, node5, link1, link2);

  // load model into engine and render
  engine.model = model;

  const Header = () => (
    <button onClick={() => action('Serialized Graph')(JSON.stringify(model.serializeDiagram(), null, 2))}>
      Serialize Graph
    </button>
  );

  return (
    <DemoWorkspace header={<Header />}>
      <DiagramWidget engine={engine} />
    </DemoWorkspace>
  );
};
