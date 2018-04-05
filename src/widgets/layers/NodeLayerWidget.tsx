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
    const diagramModel = this.props.diagramEngine.model;
    return (
      <div
        className="srd-node-layer"
        style={{
          transform:
            'translate(' +
            diagramModel.getOffsetX() +
            'px,' +
            diagramModel.getOffsetY() +
            'px) scale(' +
            diagramModel.getZoomLevel() / 100.0 +
            ')'
        }}
      >
        {Array.from(diagramModel.nodes.values()).map((node) => {
          return React.createElement(
            NodeWidget,
            {
              diagramEngine: this.props.diagramEngine,
              key: node.id,
              node
            },
            this.props.diagramEngine.generateWidgetForNode(node)
          );
        })}
      </div>
    );
  }
}
