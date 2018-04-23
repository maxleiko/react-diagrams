import * as React from 'react';
import {
  DiagramEngine,
  DefaultNodeModel,
  DefaultPortModel,
  DiagramWidget
} from '@leiko/react-diagrams';
import { distributeElements } from './dagre-utils';
import { DemoWorkspace } from '../../DemoWorkspace';

function createNode(name: any) {
  return new DefaultNodeModel(name, 'rgb(0,192,255)');
}

let count = 0;
function connectNodes(nodeFrom: any, nodeTo: any) {
  // just to get id-like structure
  count++;
  const portOut = nodeFrom.addPort(new DefaultPortModel(true, `${nodeFrom.name}-out-${count}`, 'Out'));
  const portTo = nodeTo.addPort(new DefaultPortModel(false, `${nodeFrom.name}-to-${count}`, 'IN'));
  return portOut.link(portTo);
}

export default () => {
  // 1) setup the diagram engine
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  // 3) create a default nodes
  const nodesFrom: DefaultNodeModel[] = [];
  const nodesTo: DefaultNodeModel[] = [];

  nodesFrom.push(createNode('from-1'));
  nodesFrom.push(createNode('from-2'));
  nodesFrom.push(createNode('from-3'));

  nodesTo.push(createNode('to-1'));
  nodesTo.push(createNode('to-2'));
  nodesTo.push(createNode('to-3'));

  // 4) link nodes together
  const links = nodesFrom.map((node, index) => connectNodes(node, nodesTo[index]));

  // more links for more complicated diagram
  links.push(connectNodes(nodesFrom[0], nodesTo[1]));
  links.push(connectNodes(nodesTo[0], nodesFrom[1]));
  links.push(connectNodes(nodesFrom[1], nodesTo[2]));

  // initial random position
  nodesFrom.forEach((node, index) => {
    node.x = (index * 70) + 20;
    node.y = 20;
    engine.model.addNode(node);
  });

  nodesTo.forEach((node, index) => {
    node.x = (index * 70) + 20;
    node.y = 120;
    engine.model.addNode(node);
  });

  links.forEach((link) => engine.model.addLink(link));

  return (
    <DemoWorkspace header={<button onClick={() => distributeElements(engine.model)}>Auto distribute</button>}>
      <DiagramWidget style={{ minHeight: 500 }} engine={engine} />
    </DemoWorkspace>
  );
};