import * as React from 'react';
import * as cx from 'classnames';
import { observer } from 'mobx-react';

import { DiagramEngine } from '../DiagramEngine';
import { LinkModel } from '../models/LinkModel';

export interface LinkProps {
  link: LinkModel;
  diagramEngine: DiagramEngine;
}

@observer
export class LinkWidget extends React.Component<LinkProps> {
  shouldComponentUpdate() {
    return this.props.diagramEngine.canEntityRepaint(this.props.link);
  }

  render() {
    return (
      <g
        srd-id={this.props.link.id}
        className={cx('srd-link', { 'selected': this.props.link.selected })}
      >
        {this.props.children}
      </g>
    );
  }
}
