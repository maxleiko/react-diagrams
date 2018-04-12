import * as React from 'react';
import { observer } from 'mobx-react';
import { DiagramEngine } from '../../DiagramEngine';
import { NodeWidgetContainer } from '../NodeWidgetContainer';

export interface NodeLayerProps {
  engine: DiagramEngine;
}

@observer
export class NodeLayerWidget extends React.Component<NodeLayerProps> {

  componentDidUpdate() {
    Array.from(this.props.engine.model.nodes.values()).map((node) => {
      node.updateDimensions(this.props.engine.getNodeDimensions(node));
    });
  }

  render() {
    const { nodes, offsetX, offsetY, zoom } = this.props.engine.model;
    return (
      <div
        className="srd-node-layer"
        style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom / 100.0})` }}
      >
        {Array.from(nodes.values()).map((node) => (
          <NodeWidgetContainer key={node.id} node={node}>
            {this.props.engine.generateWidgetForNode(node)}
          </NodeWidgetContainer>
        ))}
      </div>
    );
  }
}
