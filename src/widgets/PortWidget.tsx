import * as React from 'react';
import * as cx from 'classnames';
import { PortModel } from '../models/PortModel';

export interface PortProps {
  port: PortModel;
}

/**
 * @author Dylan Vorster
 */
export class PortWidget extends React.Component<PortProps> {

  render() {
    return (
      <div
        srd-id={this.props.port.id}
        className={cx('srd-port', { 'selected': this.props.port.selected })}
      >
        {this.props.children}
      </div>
    );
  }
}
