import * as React from 'react';
import { observer } from 'mobx-react';
import { DiagramEngine, DefaultNodeModel } from '@leiko/react-diagrams';

export interface CustomNodeProps {
  node: DefaultNodeModel;
  engine: DiagramEngine;
}

@observer
export class CustomNodeWidget extends React.Component<CustomNodeProps> {

  constructor(props: CustomNodeProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
  }

  onChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.node.name = e.target.value;
  }

  onMouseDown(e: React.MouseEvent<HTMLInputElement>) {
    e.stopPropagation();
  }

  render() {
    return (
      <div className="srd-default-node" style={{ background: this.props.node.color }}>
        <div className="title">
          <div className="name">{this.props.node.name}</div>
        </div>
        <div>
          <input type="text" value={this.props.node.name} onMouseDown={this.onMouseDown} onChange={this.onChange} />
        </div>
      </div>
    );
  }
}
