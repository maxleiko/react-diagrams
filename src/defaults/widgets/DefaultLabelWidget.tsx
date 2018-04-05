import * as React from 'react';
import { DefaultLabelModel } from '../models/DefaultLabelModel';

export interface DefaultLabelWidgetProps {
  model: DefaultLabelModel;
}

export class DefaultLabelWidget extends React.Component<DefaultLabelWidgetProps> {
  constructor(props: DefaultLabelWidgetProps) {
    super(props);
  }

  render() {
    return <div className="srd-default-label">{this.props.model.label}</div>;
  }
}
