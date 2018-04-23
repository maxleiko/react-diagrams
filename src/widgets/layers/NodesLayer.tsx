import * as React from 'react';
import { observer } from 'mobx-react';

import { DiagramEngine } from '../../DiagramEngine';
import { NodeWidgetContainer } from '../NodeWidgetContainer';

export interface NodesLayerProps {
  engine: DiagramEngine;
}

@observer
export class NodesLayer extends React.Component<NodesLayerProps> {

  render() {
    return this.props.engine.model.nodes.map((node) => (
      <NodeWidgetContainer key={node.id} node={node}>
        {this.props.engine.generateWidgetForNode(node)}
      </NodeWidgetContainer>
    ));
  }
}
