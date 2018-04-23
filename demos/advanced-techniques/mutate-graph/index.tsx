import * as React from 'react';
import { DiagramEngine, DefaultNodeModel, DiagramWidget, DefaultDiagramModel } from '@leiko/react-diagrams';
import { DemoWorkspace } from '../../DemoWorkspace';

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

  const updatePosition = () => {
    const firstNode = engine.model.nodes[0];
    firstNode.setPosition(firstNode.x + 30, firstNode.y + 30);
  };

  const updatePositionViaSerialize = () => {
    const modelStr = JSON.stringify(engine.model, null, 2);
    console.log('==== SERIAL before ====');
    console.log(engine.model.toJSON());
    const newModel = new DefaultDiagramModel();
    const currentModel = JSON.parse(modelStr);
    const firstNode = currentModel.nodes[0];
    firstNode.x += 30;
    firstNode.y += 30;
    newModel.fromJSON(currentModel, engine);
    engine.model = newModel;
    console.log('==== SERIAL after ====');
    console.log(engine.model.toJSON());
  };

  return (
    <DemoWorkspace
      header={[
        <button key={1} onClick={updatePosition}>
          Update position
        </button>,
        <button key={2} onClick={updatePositionViaSerialize}>
          Update position via serialize
        </button>
      ]}
    >
      <DiagramWidget engine={engine} />
    </DemoWorkspace>
  );
};
