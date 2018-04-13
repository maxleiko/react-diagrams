import * as React from 'react';
import { observer } from 'mobx-react';
import { DefaultLabelModel } from '../models/DefaultLabelModel';

export interface DefaultLabelWidgetProps {
  label: DefaultLabelModel;
}

@observer
export class DefaultLabelWidget extends React.Component<DefaultLabelWidgetProps> {
  render() {
    const { id, title, parent } = this.props.label;

    return (
      <div
        className="srd-label srd-default-label"
        srd-id={id}
        srd-link-id={parent!.id}
      >
        {title}
      </div>
    );
  }
}
