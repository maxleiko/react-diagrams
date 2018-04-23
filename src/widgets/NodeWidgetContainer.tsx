import * as React from 'react';
import * as cx from 'classnames';
import { observer } from 'mobx-react';

import { NodeModel } from '../models/NodeModel';

export interface NodeProps {
  node: NodeModel;
}

@observer
export class NodeWidgetContainer extends React.Component<NodeProps> {

  private _elem: HTMLDivElement | null = null;

  componentDidMount() {
    if (this._elem) {
      this.props.node.width = this._elem.offsetWidth;
      this.props.node.height = this._elem.offsetHeight;
    }
  }

  render() {
    const { id, x, y, selected } = this.props.node;

    return (
      <div
        ref={(elem) => this._elem = elem}
        srd-id={id}
        className={cx('srd-node', { selected })}
        style={{ transform: `translate(${x}px, ${y}px)` }}
      >
        {this.props.children}
      </div>
    );
  }
}
