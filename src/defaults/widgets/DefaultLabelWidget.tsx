import * as React from 'react';
import { observer } from 'mobx-react';
import { DefaultLabelModel } from '../models/DefaultLabelModel';

export interface DefaultLabelWidgetProps {
  model: DefaultLabelModel;
}

@observer
export class DefaultLabelWidget extends React.Component<DefaultLabelWidgetProps> {

  render() {
    return (
      <div className="srd-default-label">
        {this.props.model.label}
      </div>
    );
  }
}
