import * as React from 'react';
import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  DiagramWidget,
} from 'storm-react-diagrams';

/**
 * Shows that a limit of points can be set for links
 */
export default () => {
  // setup the diagram engine
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  const model = new DiagramModel();
  model.maxNumberPointsPerLink = 5;

  // 3-A) create a default node
  const node1 = new DefaultNodeModel('Node 1', 'rgb(0,192,255)');
  const port = node1.addOutPort('Out');
  node1.setPosition(100, 100);

  // 3-B) create another default node
  const node2 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
  const port2 = node2.addInPort('In');
  node2.setPosition(400, 100);

  // link the ports
  const link = port.link(port2);

  model.addAll(node1, node2, link);

  engine.model = model;

  return <DiagramWidget engine={engine} />;
};
