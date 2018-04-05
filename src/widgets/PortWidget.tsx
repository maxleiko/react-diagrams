import * as React from 'react';
import { NodeModel } from '../models/NodeModel';
import { BaseWidget, BaseWidgetProps } from './BaseWidget';

export interface PortProps extends BaseWidgetProps {
  name: string;
  node: NodeModel;
}

export interface PortState {
  selected: boolean;
}

/**
 * @author Dylan Vorster
 */
export class PortWidget extends BaseWidget<PortProps, PortState> {
  constructor(props: PortProps) {
    super('srd-port', props);
    this.state = {
      selected: false
    };

    this.select = this.select.bind(this);
    this.unselect = this.unselect.bind(this);
  }

  select() {
    this.setState({ selected: true });
  }

  unselect() {
    this.setState({ selected: false });
  }

  getClassName() {
    return 'port ' + super.getClassName() + (this.state.selected ? this.bem('--selected') : '');
  }

  render() {
    return (
      <div
        {...this.getProps()}
        onMouseEnter={this.select}
        onMouseLeave={this.unselect}
        data-name={this.props.name}
        data-nodeid={this.props.node.getID()}
      />
    );
  }
}
