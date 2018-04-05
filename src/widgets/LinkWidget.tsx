import { DiagramEngine } from '../DiagramEngine';
import { LinkModel } from '../models/LinkModel';
import { BaseWidget, BaseWidgetProps } from './BaseWidget';

export interface LinkProps extends BaseWidgetProps {
  link: LinkModel;
  diagramEngine: DiagramEngine;
  children?: any;
}

/**
 * @author Dylan Vorster
 */
export class LinkWidget extends BaseWidget<LinkProps> {
  constructor(props: LinkProps) {
    super('srd-link', props);
    this.state = {};
  }

  shouldComponentUpdate() {
    return this.props.diagramEngine.canEntityRepaint(this.props.link);
  }

  render() {
    return this.props.children;
  }
}
