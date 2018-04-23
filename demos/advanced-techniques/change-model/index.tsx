import * as React from 'react';
import { observer } from 'mobx-react';
import { DiagramEngine, DiagramWidget, DefaultNodeModel, DefaultDiagramModel } from '@leiko/react-diagrams';
import { DemoWorkspace } from '../../DemoWorkspace';

export default () => {
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  const modelA = createModelA();
  const modelB = createModelB();

  engine.model = modelA;

  const switchModel = () => {
    if (engine.model === modelA) {
      engine.model = modelB;
    } else {
      engine.model = modelA;
    }
  };

  const Header = observer(() => (
    <button onClick={switchModel}>Switch to model {engine.model === modelA ? 'B' : 'A'}</button>
  ));

  return (
    <DemoWorkspace header={<Header />}>
      <DiagramWidget engine={engine} />
    </DemoWorkspace>
  );
};

function createModelA() {
  const model = new DefaultDiagramModel();

  const node1 = new DefaultNodeModel('Node1 from A', 'rgba(162, 255, 0)');
  const p1 = node1.addOutPort('out');
  node1.setPosition(100, 50);
  model.addNode(node1);

  const node2 = new DefaultNodeModel('Node2 from A', 'rgba(255, 255, 0)');
  const p2 = node2.addInPort('in');
  node2.setPosition(220, 50);
  model.addNode(node2);

  model.addLink(p1.link(p2));

  return model;
}

function createModelB() {
  const model = new DefaultDiagramModel();
  model.zoom = 200;

  const node = new DefaultNodeModel('Node from B', 'rgba(162, 198, 255)');
  node.setPosition(50, 50);
  model.addNode(node);

  return model;
}
