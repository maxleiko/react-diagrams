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
      const rect = this._elem.getBoundingClientRect();

      const point = this.props.engine.getRelativePoint(rect.left, rect.top);
      const x = this._elem.offsetWidth / 2 + point.x;
      const y = this._elem.offsetHeight / 2 + point.y;

      // prevent unecessary re-rendering
      if (this.props.port.x !== x || this.props.port.y !== y) {
        // update port position for points
        this.props.port.setPosition(x, y);
      }
    }
  }

  render() {
    return (
      <div
        ref={(elem) => this._elem = elem}
        srd-id={this.props.port.id}
        className={cx('srd-port', { 'selected': this.props.port.selected })}
      >
        {this.props.children}
      </div>
    );
  }
}
