import * as React from 'react';
import * as cx from 'classnames';
import { NodeModel } from '../models/NodeModel';

export interface NodeProps {
  node: NodeModel;
}

/**
 * @author Dylan Vorster
 */
export class NodeWidget extends React.Component<NodeProps> {

  render() {
    return (
      <div
        srd-id={this.props.node.id}
        className={cx('srd-node', { 'selected': this.props.node.selected })}
        style={{ top: this.props.node.y, left: this.props.node.x }}
      >
        {this.props.children}
      </div>
    );
  }
}
