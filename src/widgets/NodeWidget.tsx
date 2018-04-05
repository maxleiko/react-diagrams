import * as React from 'react';
import * as cx from 'classnames';
import { DiagramEngine } from '../DiagramEngine';
import { NodeModel } from '../models/NodeModel';

export interface NodeProps {
  node: NodeModel;
  diagramEngine: DiagramEngine;
}

/**
 * @author Dylan Vorster
 */
export class NodeWidget extends React.Component<NodeProps> {

  shouldComponentUpdate() {
    return this.props.diagramEngine.canEntityRepaint(this.props.node);
  }

  render() {
    return (
      <div
        className={cx('srd-node', { '--selected': this.props.node.selected })}
        data-nodeid={this.props.node.id}
        style={{
          top: this.props.node.y,
          left: this.props.node.x
        }}
      >
        {this.props.children}
      </div>
    );
  }
}
