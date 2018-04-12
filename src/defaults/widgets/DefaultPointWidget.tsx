import * as React from 'react';
import * as cx from 'classnames';
import { observer } from 'mobx-react';

import { DefaultPointModel } from '../models/DefaultPointModel';

export interface DefaultPointWidgetProps {
  point: DefaultPointModel;
}

@observer
export class DefaultPointWidget extends React.Component<DefaultPointWidgetProps> {
  render() {
    return (
      <g
        key={this.props.point.id}
        srd-id={this.props.point.id}
        srd-link-id={this.props.point.parent!.id}
        className={cx('srd-point', { selected: this.props.point.selected })}
      >
        <circle cx={this.props.point.x} cy={this.props.point.y} r={5} className="point" />
      </g>
    );
  }
}
