import * as React from 'react';
import * as cx from 'classnames';
import { observer } from 'mobx-react';

import { PortModel } from '../models/PortModel';
import { DiagramEngine } from '../DiagramEngine';

export interface PortProps {
  port: PortModel;
  engine: DiagramEngine;
}

@observer
export class PortWidgetContainer extends React.Component<PortProps> {
  private _elem: HTMLDivElement | null = null;

  componentDidMount() {
    if (this._elem) {
      this.props.engine.registerPortRef(this.props.port, this._elem);
    }
  }

  componentWillUnmount() {
    this.props.engine.unregisterPortRef(this.props.port);
  }

  render() {
    const { id, selected } = this.props.port;

    return (
      <div ref={(elem) => (this._elem = elem)} srd-id={id} className={cx('srd-port', { selected })}>
        {this.props.children}
      </div>
    );
  }
}
