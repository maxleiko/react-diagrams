import * as React from 'react';
import * as cx from 'classnames';
import { DefaultPortModel } from '../models/DefaultPortModel';
import { PortWidget } from '../../widgets/PortWidget';

export interface DefaultPortWidgetProps {
  port: DefaultPortModel;
}

/**
 * @author Dylan Vorster
 */
export class DefaultPortWidget extends React.Component<DefaultPortWidgetProps> {

  render() {
    const port = <PortWidget port={this.props.port} />;
    const label = <div className="name">{this.props.port.label}</div>;

    return (
      <div className={cx('srd-default-port', this.props.port.in ? 'in' : 'out')}>
        {this.props.port.in ? port : label}
        {this.props.port.in ? label : port}
      </div>
    );
  }
}
