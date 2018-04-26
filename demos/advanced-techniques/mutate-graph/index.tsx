import * as React from 'react';
import { DiagramEngine, DefaultNodeModel, DiagramWidget, DefaultDiagramModel } from '@leiko/react-diagrams';
import { DemoWorkspace } from '../../DemoWorkspace';
import { action } from 'mobx';

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
  node2.setPosition(200, 120);

  // 3-C) link the 2 nodes together
  const link1 = port1.link(port2)!;

  // 4) add the models to the root graph
  engine.model.addAll(node1, node2, link1);

  let angle = 0;

  const updatePosition = action(() => {
    const node0 = engine.model.nodes[0];
    const c = engine.model.nodes[1];
    // rotate around c
    angle = (angle + 10) % 360;
    const x = Math.floor(c.x + 100 * Math.cos(angle * Math.PI / 180));
    const y = Math.floor(c.y + 100 * Math.sin(angle * Math.PI / 180));
    node0.setPosition(x, y);
  });

  const updatePositionViaSerialize = () => {
    console.log('==== SERIAL before ====');
    console.log(JSON.parse(JSON.stringify(engine.model)));
    const currentModel = JSON.parse(JSON.stringify(engine.model));
    const node0 = currentModel.nodes[0];
    const c = currentModel.nodes[1];
    // rotate around c
    angle = (angle + 10) % 360;
    node0.x = Math.floor(c.x + 100 * Math.cos(angle * Math.PI / 180));
    node0.y = Math.floor(c.y + 100 * Math.sin(angle * Math.PI / 180));
    const newModel = new DefaultDiagramModel();
    engine.model = newModel;
    newModel.fromJSON(currentModel, engine);
    console.log('==== SERIAL after ====');
    console.log(JSON.parse(JSON.stringify(engine.model)));
  };

  updatePosition();

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
