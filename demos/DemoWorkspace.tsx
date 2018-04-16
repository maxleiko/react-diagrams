import * as React from 'react';

export interface DemoWorkspaceProps {
  header?: React.ReactNode;
}

export class DemoWorkspace extends React.Component<DemoWorkspaceProps> {

  render() {
    return (
      <div className="srd-demo-workspace">
        <div className="srd-demo-workspace__toolbar">{this.props.header && this.props.header || null}</div>
        <div className="srd-demo-workspace__content">{this.props.children}</div>
      </div>
    );
  }
}
