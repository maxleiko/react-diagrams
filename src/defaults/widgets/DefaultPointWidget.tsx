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
    const { id, selected, x, y, parent } = this.props.point;

    return (
      <g
        key={id}
        srd-id={id}
        srd-link-id={parent!.id}
        className={cx('srd-point', { selected })}
      >
        <circle cx={x} cy={y} r={5} className="point" />
      </g>
    );
  }
}
