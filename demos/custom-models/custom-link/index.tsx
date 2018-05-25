import {
  DiagramEngine,
  DefaultNodeModel,
  DiagramWidget,
  DefaultLabelFactory,
  DefaultNodeFactory,
} from '@leiko/react-diagrams';
import * as React from 'react';
import { CustomLinkFactory } from './CustomLinkFactory';
import { CustomPortModel } from './CustomPortModel';
import { CustomPortFactory } from './CustomPortFactory';

export default () => {
  // 1) setup the diagram engine
  const engine = new DiagramEngine();
  // register our custom factories
  engine.registerLinkFactory(new CustomLinkFactory());
  engine.registerPortFactory(new CustomPortFactory());
  // also register default factories for the rest
  engine.registerNodeFactory(new DefaultNodeFactory());
  engine.registerLabelFactory(new DefaultLabelFactory());

  // create some nodes
  const node1 = new DefaultNodeModel('Source', 'rgb(0,192,255)');
  const port1 = node1.addPort(new CustomPortModel(false, 'Out'));
  node1.setPosition(150, 50);

  const node2 = new DefaultNodeModel('Target', 'rgb(192,255,0)');
  const port2 = node2.addPort(new CustomPortModel(true, 'In thick'));
  node2.setPosition(220, 120);

  const node3 = new DefaultNodeModel('Source', 'rgb(0,192,255)');
  node3.addPort(new CustomPortModel(false, 'one'));
  node3.addPort(new CustomPortModel(false, 'two'));
  node3.setPosition(400, 300);

  const node4 = new DefaultNodeModel('Target', 'rgb(192,255,0)');
  node4.addPort(new CustomPortModel(true, 'in'));
  node4.setPosition(500, 250);

  engine.model.addAll(port1.link(port2));

  // add everything else
  engine.model.addAll(node1, node2, node3, node4);

  // render the diagram!
  return <DiagramWidget className="srd-demo-canvas" engine={engine} />;
};
