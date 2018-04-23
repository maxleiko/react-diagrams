import * as React from 'react';
import { observer } from 'mobx-react';
import { DiagramEngine } from '../../DiagramEngine';
import { NodesLayer } from './NodesLayer';

export interface NodeLayerProps {
  engine: DiagramEngine;
}

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
