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

  const node = new DefaultNodeModel('Node from A', 'rgba(162, 255, 0)');
  node.setPosition(100, 50);
  model.addNode(node);

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
