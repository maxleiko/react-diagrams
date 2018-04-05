import * as React from 'react';
import * as cx from 'classnames';
import { DefaultPortModel } from '../models/DefaultPortModel';
import { PortWidget } from '../../widgets/PortWidget';

export interface DefaultPortLabelProps {
  model: DefaultPortModel;
}

/**
 * @author Dylan Vorster
 */
export class DefaultPortLabel extends React.Component<DefaultPortLabelProps> {

  render() {
    const port = <PortWidget port={this.props.model} />;
    const label = <div className="name">{this.props.model.label}</div>;

    return (
      <div {...this.props} className={cx('srd-default-port', this.props.model.in ? 'in' : 'out')}>
        {this.props.model.in ? port : label}
        {this.props.model.in ? label : port}
      </div>
    );
  }
}
