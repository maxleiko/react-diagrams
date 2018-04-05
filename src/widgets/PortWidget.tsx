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
  constructor(props: PortProps) {
    super(props);
    this.select = this.select.bind(this);
    this.unselect = this.unselect.bind(this);
  }

  select() {
    this.props.port.selected = true;
  }

  unselect() {
    this.props.port.selected = false;
  }

  render() {
    return (
      <div
        className={cx('srd-port', { '--selected': this.props.port.selected })}
        onMouseEnter={this.select}
        onMouseLeave={this.unselect}
        data-name={this.props.port.name}
        data-nodeid={this.props.port.parent!.id}
      />
    );
  }
}
