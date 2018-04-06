import * as React from 'react';
import { DiamondNodeModel } from './DiamondNodeModel';
import { PortWidget } from 'storm-react-diagrams';

export interface DiamonNodeWidgetProps {
  node: DiamondNodeModel;
  size?: number;
}

/**
 * @author Dylan Vorster
 */
export class DiamonNodeWidget extends React.Component<DiamonNodeWidgetProps> {
  static defaultProps: Partial<DiamonNodeWidgetProps> = {
    size: 150,
  };

  constructor(props: DiamonNodeWidgetProps) {
    super(props);
    this.state = {};
  }

  render() {
    const size = this.props.size!;

    return (
      <div
        className={'diamond-node'}
        style={{
          position: 'relative',
          width: size,
          height: size
        }}
      >
        <svg
          width={size}
          height={size}
          dangerouslySetInnerHTML={{
            __html:
              `
          <g id="Layer_1">
          </g>
          <g id="Layer_2">
            <polygon fill="purple" stroke="#000000" stroke-width="3" stroke-miterlimit="10" points="10,` +
              size / 2 +
              ` ` +
              size / 2 +
              `,10 ` +
              (size - 10) +
              `,` +
              size / 2 +
              ` ` +
              size / 2 +
              `,` +
              (size - 10) +
              ` "/>
          </g>
        `
          }}
        />
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            top: size / 2 - 8,
            left: -8
          }}
        >
          <PortWidget port={this.props.node.getPortFromID('left')!} />
        </div>
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            left: size / 2 - 8,
            top: -8
          }}
        >
          <PortWidget port={this.props.node.getPortFromID('top')!} />
        </div>
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            left: size - 8,
            top: size / 2 - 8
          }}
        >
          <PortWidget port={this.props.node.getPortFromID('right')!} />
        </div>
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            left: size / 2 - 8,
            top: size - 8
          }}
        >
          <PortWidget port={this.props.node.getPortFromID('bottom')!} />
        </div>
      </div>
    );
  }
}
