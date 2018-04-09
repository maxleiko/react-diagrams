import * as React from 'react';
import * as cx from 'classnames';
import { observer } from 'mobx-react';

import { PortModel } from '../models/PortModel';

export interface PortProps {
  port: PortModel;
}

@observer
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
