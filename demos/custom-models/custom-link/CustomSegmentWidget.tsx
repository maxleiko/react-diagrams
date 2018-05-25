import * as React from 'react';
import { DefaultLinkModel } from '@leiko/react-diagrams';

export interface CustomSegmentWidgetProps {
  model: DefaultLinkModel;
  path: string;
}

export class CustomSegmentWidget extends React.Component<CustomSegmentWidgetProps> {
  percent: number = 0;
  path: SVGPathElement | null = null;
  handle: any = null;
  circle: SVGCircleElement | null = null;
  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    requestAnimationFrame(() => this.animationHandler());
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  animationHandler() {
    if (!this.circle || !this.path) {
      return;
    }

    this.percent += 2;
    if (this.percent > 100) {
      this.percent = 0;
    }

    const point = this.path.getPointAtLength(this.path.getTotalLength() * (this.percent / 100.0));

    this.circle.setAttribute('cx', '' + point.x);
    this.circle.setAttribute('cy', '' + point.y);

    if (this.mounted) {
      requestAnimationFrame(() => this.animationHandler());
    }
  }

  render() {
    return (
      <>
        <path
          ref={(ref) => {
            this.path = ref;
          }}
          strokeWidth={this.props.model.width}
          stroke={this.props.model.color}
          fill="none"
          d={this.props.path}
        />
        <circle
          ref={(ref) => {
            this.circle = ref;
          }}
          r={3}
          fill="orange"
        />
      </>
    );
  }
}