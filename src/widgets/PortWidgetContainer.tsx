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
      this.props.port.setPosition(this._elem.offsetLeft, this._elem.offsetTop);
      this.props.port.setSize(this._elem.offsetWidth, this._elem.offsetHeight);
    }
  }

  componentWillUpdate() {
    if (this._elem) {
      this.props.port.setPosition(this._elem.offsetLeft, this._elem.offsetTop);
      this.props.port.setSize(this._elem.offsetWidth, this._elem.offsetHeight);
    }
  }

  render() {
    const { id, selected, connected } = this.props.port;

    if (this._elem) {
      this.props.port.setPosition(this._elem.offsetLeft, this._elem.offsetTop);
      this.props.port.setSize(this._elem.offsetWidth, this._elem.offsetHeight);
    }

    return (
      <div ref={(elem) => (this._elem = elem)} srd-id={id} className={cx('srd-port', { selected, connected })}>
        {this.props.children}
      </div>
    );
  }
}
