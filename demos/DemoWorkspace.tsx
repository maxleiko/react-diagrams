import * as React from 'react';

export interface DemoWorkspaceProps {
  header?: React.ReactNode;
}

export class DemoWorkspace extends React.Component<DemoWorkspaceProps> {

  render() {
    return (
      <div className="workspace">
        <div className="toolbar">{this.props.header && this.props.header || null}</div>
        <div className="content">{this.props.children}</div>
      </div>
    );
  }
}
