import * as React from 'react';
import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  DiagramWidget,
  DiagramProps
} from 'storm-react-diagrams';

/**
 * Shows that a limit of points can be set for links
 */
export default () => {
  // setup the diagram engine
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  const model = new DiagramModel();

  //3-A) create a default node
  const node1 = new DefaultNodeModel('Node 1', 'rgb(0,192,255)');
  const port = node1.addOutPort('Out');
  node1.setPosition(100, 100);

  //3-B) create another default node
  const node2 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
  const port2 = node2.addInPort('In');
  node2.setPosition(400, 100);

  // link the ports
  const link1 = port.link(port2);

  model.addAll(node1, node2, link1);

  engine.setDiagramModel(model);

  const props = {
    diagramEngine: engine,
    maxNumberPointsPerLink: 5
  } as DiagramProps;

  return (
    <div>
      <p>A maximum of 5 points can be created per link.</p>
      <DiagramWidget className="srd-demo-canvas" {...props} />
    </div>
  );
};
