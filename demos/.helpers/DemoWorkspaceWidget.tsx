import * as React from 'react';

export interface DemoWorkspaceWidgetProps {
  buttons?: any;
}

export class DemoWorkspaceWidget extends React.Component<DemoWorkspaceWidgetProps> {
  constructor(props: DemoWorkspaceWidgetProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="srd-demo-workspace">
        <div className="srd-demo-workspace__toolbar">{this.props.buttons}</div>
        <div className="srd-demo-workspace__content">{this.props.children}</div>
      </div>
    );
  }
}
