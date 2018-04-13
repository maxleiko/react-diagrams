import * as React from 'react';
import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  DiagramWidget,
  DefaultPointModel,
} from 'storm-react-diagrams';

/**
 *
 * Shows how you can lock down the system so that the entire scene cant be interacted with.
 *
 * @Author Dylan Vorster
 */
export default () => {
  // 1) setup the diagram engine
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  const model = new DiagramModel();

  // sample for link with simple line (no additional points)
  const node1 = new DefaultNodeModel('Node 1', 'rgb(0,192,255)');
  const port1 = node1.addOutPort('Out');
  node1.setPosition(100, 100);

  const node2 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
  const port2 = node2.addInPort('In');
  node2.setPosition(400, 100);

  const link1 = port1.link(port2)!;

  model.addAll(node1, node2, link1);

  // sample for link with complex line (additional points)
  const node3 = new DefaultNodeModel('Node 3', 'rgb(0,192,255)');
  const port3 = node3.addOutPort('Out');
  node3.setPosition(100, 250);

  const node4 = new DefaultNodeModel('Node 4', 'rgb(192,255,0)');
  const port4 = node4.addInPort('In');
  node4.setPosition(400, 250);

  const link2 = port3.link(port4)!;

  link2.addPoint(new DefaultPointModel(350, 225));
  link2.addPoint(new DefaultPointModel(200, 225));

  model.addAll(node3, node4, link2);

  engine.model = model;

  // !========================================= <<<<<<<

  model.locked = true;
  model.allowLooseLinks = false;
  model.allowCanvasTranslation = false;
  model.allowCanvasZoom = false;

  // !=========================================  <<<<<<<

  return <DiagramWidget className="srd-demo-canvas" engine={engine} />;
};
