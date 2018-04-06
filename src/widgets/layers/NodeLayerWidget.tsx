import * as React from 'react';
import { DiagramEngine } from '../../DiagramEngine';
import { NodeWidget } from '../NodeWidget';

export interface NodeLayerProps {
  diagramEngine: DiagramEngine;
}

export class NodeLayerWidget extends React.Component<NodeLayerProps> {

  updateNodeDimensions = () => {
    if (!this.props.diagramEngine.nodesRendered) {
      Array.from(this.props.diagramEngine.model.nodes.values()).map((node) => {
        node.updateDimensions(this.props.diagramEngine.getNodeDimensions(node));
      });
    }
  }

  componentDidUpdate() {
    this.updateNodeDimensions();
    this.props.diagramEngine.nodesRendered = true;
  }

  render() {
    const { nodes, offsetX, offsetY, zoom } = this.props.diagramEngine.model;
    return (
      <div
        className="srd-node-layer"
        style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom / 100.0})` }}
      >
        {Array.from(nodes.values()).map((node) => (
          <NodeWidget key={node.id} node={node}>
            {this.props.diagramEngine.generateWidgetForNode(node)}
          </NodeWidget>
        ))}
      </div>
    );
  }
}
