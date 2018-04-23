import * as React from 'react';
import { DiamondNodeModel } from './DiamondNodeModel';
import { DiagramEngine } from '@leiko/react-diagrams';

export interface DiamonNodeWidgetProps {
  node: DiamondNodeModel;
  engine: DiagramEngine;
  size?: number;
}

/**
 * @author Dylan Vorster
 */
export class DiamonNodeWidget extends React.Component<DiamonNodeWidgetProps> {
  static defaultProps: Partial<DiamonNodeWidgetProps> = {
    size: 150
  };

  render() {
    const size = this.props.size!;
    const engine = this.props.engine;

    return (
      <div className="diamond-node" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <g>
            <polygon
              className="polygon"
              fill="purple"
              stroke="#000000"
              strokeWidth="3"
              strokeMiterlimit="10"
              points={`10,${size / 2} ${size / 2},10 ${size - 10},${size / 2} ${size / 2},${size - 10}`}
            />
          </g>
        </svg>
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            top: size / 2 - 8,
            left: -8
          }}
        >
          {engine.generateWidgetForPort(this.props.node.getPort('left')!)}
        </div>
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            left: size / 2 - 8,
            top: -8
          }}
        >
          {engine.generateWidgetForPort(this.props.node.getPort('top')!)}
        </div>
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            left: size - 8,
            top: size / 2 - 8
          }}
        >
          {engine.generateWidgetForPort(this.props.node.getPort('right')!)}
        </div>
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            left: size / 2 - 8,
            top: size - 8
          }}
        >
          {engine.generateWidgetForPort(this.props.node.getPort('bottom')!)}
        </div>
      </div>
    );
  }
}
