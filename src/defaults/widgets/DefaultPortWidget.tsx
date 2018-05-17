import * as React from 'react';
import * as cx from 'classnames';
import { observer } from 'mobx-react';

import { DefaultPortModel } from '../models/DefaultPortModel';
import { PortWidgetContainer } from '../../widgets/PortWidgetContainer';
import { DiagramEngine } from '../../DiagramEngine';

export interface DefaultPortWidgetProps {
  port: DefaultPortModel;
  engine: DiagramEngine;
}

@observer
export class DefaultPortWidget extends React.Component<DefaultPortWidgetProps> {

  render() {
    const port = <PortWidgetContainer port={this.props.port} engine={this.props.engine} />;
    const name = <div className="name">{this.props.port.name}</div>;

    return (
      <div className={cx('srd-default-port')}>
        {this.props.port.in ? port : name}
        {this.props.port.in ? name : port}
      </div>
    );
  }
}
