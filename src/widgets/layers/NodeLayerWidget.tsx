import * as React from 'react';
import { observer } from 'mobx-react';
import { DiagramEngine } from '../../DiagramEngine';
import { NodeWidgetContainer } from '../NodeWidgetContainer';

export interface NodeLayerProps {
  engine: DiagramEngine;
}

const NodesLayer = observer(({ engine }: { engine: DiagramEngine }) => (
  <>
    {engine.model.nodes.map((node) => (
      <NodeWidgetContainer key={node.id} node={node}>
        {engine.generateWidgetForNode(node)}
      </NodeWidgetContainer>
    ))}
  </>
));

@observer
export class NodeLayerWidget extends React.Component<NodeLayerProps> {

  render() {
    const { offsetX, offsetY, zoom } = this.props.engine.model;
    return (
      <div
        className="srd-node-layer"
        style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom / 100.0})` }}
      >
        <NodesLayer engine={this.props.engine} />
      </div>
    );
  }
}
