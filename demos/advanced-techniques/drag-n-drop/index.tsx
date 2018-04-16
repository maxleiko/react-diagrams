import * as React from 'react';
import { DiagramEngine, DiagramModel, DefaultNodeModel, DiagramWidget } from 'storm-react-diagrams';
import { DemoWorkspace } from '../../DemoWorkspace';

import './styles.scss';

const DATA_TRANSFER = 'srd-dnd';

export default () => {
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  const model = new DiagramModel();
  engine.model = model;

  const node1 = new DefaultNodeModel('Node 1', 'rgb(0,192,255)');
  const port0 = node1.addOutPort('Out');
  node1.setPosition(100, 100);

  const node2 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
  const port1 = node2.addInPort('In');
  node2.setPosition(400, 100);

  const link = port0.link(port1);

  model.addAll(node1, node2, link);

  return (
    <DemoWorkspace>
      <div className="container">
        <div className="sidebar">
          <SidebarItem name="In Node" type="in" color="rgb(192,255,0)" />
          <SidebarItem name="Out Node" type="out" color="rgb(0,192,255)" />
        </div>
        <div
          className="diagram-layer"
          onDrop={(event) => {
            const data = event.dataTransfer.getData(DATA_TRANSFER);
            const nodesCount = engine.model.nodes.size;

            let node = null;
            if (data === 'in') {
              node = new DefaultNodeModel('Node ' + (nodesCount + 1), 'rgb(192,255,0)');
              node.addInPort('In');
            } else if (data === 'out') {
              node = new DefaultNodeModel('Node ' + (nodesCount + 1), 'rgb(0,192,255)');
              node.addOutPort('Out');
            } else {
              // unknown drop data
            }

            if (node) {
              const { x, y } = engine.getRelativeMousePoint(event);
              node.x = x;
              node.y = y;
              engine.model.addNode(node);
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
          }}
        >
          <DiagramWidget engine={engine} />
        </div>
      </div>
    </DemoWorkspace>
  );
};

export interface SidebarItemProps {
  name: string;
  type: 'in' | 'out';
  color: string;
}

export const SidebarItem = ({ name, color, type }: SidebarItemProps) => (
  <div
    style={{ borderColor: color }}
    draggable={true}
    onDragStart={(event) => event.dataTransfer.setData(DATA_TRANSFER, type)}
    className="sidebar-item"
  >
    {name}
  </div>
);