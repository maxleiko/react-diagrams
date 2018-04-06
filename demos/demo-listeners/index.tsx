import * as React from 'react';
// @ts-ignore
import { action } from '@storybook/addon-actions';
import { DiagramEngine, DiagramModel, DiagramProps, DefaultNodeModel, DiagramWidget } from 'storm-react-diagrams';

/**
 * Shows some of the events triggered when elements are selected
 */
export default () => {
  // setup the diagram engine
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  const model = new DiagramModel();

  // sample for link with simple line
  const node1 = new DefaultNodeModel('Node 1', 'rgb(255,99,66)');
  const node1Out = node1.addOutPort('Out');
  node1.setPosition(100, 100);

  const node2 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
  node2.addInPort('In');
  node2.setPosition(400, 40);

  const node3 = new DefaultNodeModel('Node 3', 'rgb(128,99,255)');
  const node3In = node3.addInPort('In');
  node3.setPosition(300, 160);

  // link node1.out with node3.in
  const link = node1Out.link(node3In)!;

  // add all the models
  const models = model.addAll(node1, node2, node3, link);

  // add a selection listener to each
  models.forEach((item) => {
    item.addListener({
      selectionChanged: action('selectionChanged'),
      entityRemoved: action('entityRemoved'),
      lockChanged: action('lockChanged')
    });
  });

  model.addListener({
    linksUpdated: action('linksUpdated')
  });

  engine.model = model;

  const props = {
    diagramEngine: engine,
    maxNumberPointsPerLink: 0 // no extra points so link selection is fired straight away
  } as DiagramProps;

  return (
    <div>
      <p>To see the possible events you can:</p>
      <ul>
        <li>select a node</li>
        <li>move a node</li>
        <li>
          <code>Del</code> a selected node or link
        </li>
        <li>create a link between ports</li>
      </ul>
      <DiagramWidget className="srd-demo-canvas" {...props} />
    </div>
  );
};
