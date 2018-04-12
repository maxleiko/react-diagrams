import * as React from 'react';
import { observer } from 'mobx-react';

import { DefaultNodeModel } from '../models/DefaultNodeModel';
import { DiagramEngine } from '../../DiagramEngine';
import { DefaultPortModel } from '../models/DefaultPortModel';

export interface DefaultNodeProps {
  node: DefaultNodeModel;
  engine: DiagramEngine;
}

interface PortsProps {
  className: 'in'|'out';
  ports: DefaultPortModel[];
  engine: DiagramEngine;
}

const Ports = observer(({ className, ports, engine }: PortsProps) => (
  <div className={className}>
    {ports.map((port) => (<div key={port.id}>{engine.generateWidgetForPort(port)}</div>))}
  </div>
));

@observer
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
          <Ports className="in" engine={this.props.engine} ports={this.props.node.inputs} />
          <Ports className="out" engine={this.props.engine} ports={this.props.node.outputs} />
        </div>
      </div>
    );
  }
}
