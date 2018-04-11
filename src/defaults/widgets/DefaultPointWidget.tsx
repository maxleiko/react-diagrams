import * as React from 'react';
import * as cx from 'classnames';

import { DefaultPointModel } from '../models/DefaultPointModel';

export interface DefaultPointWidgetProps {
  point: DefaultPointModel;
}

export class DefaultPointWidget extends React.Component<DefaultPointWidgetProps> {
  render() {
    return (
      <g
        key={this.props.point.id}
        srd-id={this.props.point.id}
        className={cx('srd-point', { selected: this.props.point.selected })}
      >
        <circle cx={this.props.point.x} cy={this.props.point.y} r={5} className="point" />
      </g>
    );
  }
}
