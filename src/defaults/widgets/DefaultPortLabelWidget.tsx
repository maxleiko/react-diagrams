import * as React from 'react';
import { DefaultPortModel } from '../models/DefaultPortModel';
import { PortWidget } from '../../widgets/PortWidget';
import { BaseWidget, BaseWidgetProps } from '../../widgets/BaseWidget';

export interface DefaultPortLabelProps extends BaseWidgetProps {
  model: DefaultPortModel;
}

/**
 * @author Dylan Vorster
 */
export class DefaultPortLabel extends BaseWidget<DefaultPortLabelProps> {
  constructor(props: DefaultPortLabelProps) {
    super('srd-default-port', props);
  }

  getClassName() {
    return super.getClassName() + (this.props.model.in ? this.bem('--in') : this.bem('--out'));
  }

  render() {
    const port = <PortWidget node={this.props.model.getParent()} name={this.props.model.name} />;
    const label = <div className="name">{this.props.model.label}</div>;

    return (
      <div {...this.getProps()}>
        {this.props.model.in ? port : label}
        {this.props.model.in ? label : port}
      </div>
    );
  }
}
