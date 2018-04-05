import * as React from 'react';
import * as _ from 'lodash';
import { DefaultNodeModel } from '../models/DefaultNodeModel';
import { DefaultPortModel } from '../models/DefaultPortModel';
import { DefaultPortLabel } from './DefaultPortLabelWidget';
import { DiagramEngine } from '../../DiagramEngine';

export interface DefaultNodeProps {
  node: DefaultNodeModel;
  diagramEngine: DiagramEngine;
}

/**
 * @author Dylan Vorster
 */
export class DefaultNodeWidget extends React.Component<DefaultNodeProps> {

  generatePort(port: DefaultPortModel) {
    return <DefaultPortLabel model={port} key={port.id} />;
  }

  render() {
    return (
      <div {...this.props} className="srd-default-node" style={{ background: this.props.node.color }}>
        <div className="title">
          <div className="name">{this.props.node.name}</div>
        </div>
        <div className="ports">
          <div className="in">{_.map(this.props.node.getInPorts(), this.generatePort.bind(this))}</div>
          <div className="out">{_.map(this.props.node.getOutPorts(), this.generatePort.bind(this))}</div>
        </div>
      </div>
    );
  }
}
