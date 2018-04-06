import * as React from 'react';
import { DefaultNodeModel } from '../models/DefaultNodeModel';
import { DiagramEngine } from '../../DiagramEngine';
import { DefaultPortModel } from '../models/DefaultPortModel';

export interface DefaultNodeProps {
  node: DefaultNodeModel;
  engine: DiagramEngine;
}

/**
 * @author Dylan Vorster
 */
export class DefaultNodeWidget extends React.Component<DefaultNodeProps> {

  constructor(props: DefaultNodeProps) {
    super(props);
    this.renderPort = this.renderPort.bind(this);
  }

  renderPort(port: DefaultPortModel) {
    return <div key={port.id}>{this.props.engine.generateWidgetForPort(port)}</div>;
  }

  render() {
    return (
      <div className="srd-default-node" style={{ background: this.props.node.color }}>
        <div className="title">
          <div className="name">{this.props.node.name}</div>
        </div>
        <div className="ports">
          <div className="in">{this.props.node.getInPorts().map(this.renderPort)}</div>
          <div className="out">{this.props.node.getOutPorts().map(this.renderPort)}</div>
        </div>
      </div>
    );
  }
}
