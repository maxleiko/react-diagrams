import * as React from 'react';
import * as cx from 'classnames';
import { observer } from 'mobx-react';

import { LinkModel } from '../models/LinkModel';

export interface LinkProps {
  link: LinkModel;
}

@observer
export class LinkWidgetContainer extends React.Component<LinkProps> {

  render() {
    const { id, selected } = this.props.link;
    return (
      <g srd-id={id} className={cx('srd-link', { selected })}>
        {this.props.children}
      </g>
    );
  }
}
