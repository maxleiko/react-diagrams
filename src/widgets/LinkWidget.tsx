import * as React from 'react';
import * as cx from 'classnames';
import { DiagramEngine } from '../DiagramEngine';
import { LinkModel } from '../models/LinkModel';

export interface LinkProps {
  link: LinkModel;
  diagramEngine: DiagramEngine;
}

/**
 * @author Dylan Vorster
 */
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
