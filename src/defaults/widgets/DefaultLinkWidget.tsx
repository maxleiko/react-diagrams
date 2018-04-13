import * as React from 'react';
import * as cx from 'classnames';
import { observer } from 'mobx-react';
import { DiagramEngine } from '../../DiagramEngine';
import { PointModel } from '../../models/PointModel';
import { Toolkit } from '../../Toolkit';
import { DefaultLinkModel } from '../models/DefaultLinkModel';
import { PathFinding } from '../../routing/PathFinding';
import * as _ from 'lodash';
import { LabelModel } from '../../models/LabelModel';
import { DefaultPortModel } from 'storm-react-diagrams';

export interface DefaultLinkProps {
  color?: string;
  width?: number;
  smooth?: boolean;
  link: DefaultLinkModel;
  engine: DiagramEngine;
  pointAdded?: (point: PointModel, event: React.MouseEvent<HTMLElement>) => any;
}

@observer
export class DefaultLinkWidget extends React.Component<DefaultLinkProps> {
  static defaultProps: Partial<DefaultLinkProps> = {
    color: 'black',
    width: 3,
    smooth: false
  };

  // DOM references to the label and paths (if label is given), used to calculate dynamic positioning
  private _elem: SVGGElement | null = null;
  private _labelElems: { [id: string]: HTMLDivElement | null } = {};
  private _pathFinding: PathFinding | null = null; // only set when smart routing is active

  constructor(props: DefaultLinkProps) {
    super(props);
    if (props.engine.model.smartRouting) {
      this._pathFinding = new PathFinding(this.props.engine);
    }

    this.calculateLabelPosition = this.calculateLabelPosition.bind(this);
    this.calculateAllLabelPosition = this.calculateAllLabelPosition.bind(this);
    this.findPathAndRelativePositionToRenderLabel = this.findPathAndRelativePositionToRenderLabel.bind(this);
  }

  calculateAllLabelPosition() {
    _.forEach(this.props.link.labels, (label, index) => {
      this.calculateLabelPosition(label, index + 1);
    });
  }

  componentDidUpdate() {
    if (this.props.link.labels.length > 0) {
      window.requestAnimationFrame(this.calculateAllLabelPosition);
    }
  }

  componentDidMount() {
    if (this.props.link.labels.length > 0) {
      window.requestAnimationFrame(this.calculateAllLabelPosition);
    }
  }

  generateLabel(label: LabelModel) {
    const canvas = this.props.engine.canvas as HTMLElement;
    const factory = this.props.engine.getFactoryForLabel(label);
    return (
      <foreignObject key={label.id} className="label" width={canvas.offsetWidth} height={canvas.offsetHeight}>
        <div ref={(ref) => (this._labelElems[label.id] = ref)}>
          {factory.generateReactWidget(this.props.engine, label)}
        </div>
      </foreignObject>
    );
  }

  generateSegment(engine: DiagramEngine, link: DefaultLinkModel, key: number, svgPath: string) {
    return engine.getFactoryForLink(link).generateSegment(this.props.engine, link, key, svgPath);
  }

  generatePoint(engine: DiagramEngine, point: PointModel) {
    return React.cloneElement(engine.getFactoryForPoint(point).generateReactWidget(engine, point), {
      key: `point-${point.id}`
    });
  }

  findPathAndRelativePositionToRenderLabel(index: number) {
    // an array to hold all path lengths, making sure we hit the DOM only once to fetch this information
    if (this._elem) {
      const lengths = Array.from(this._elem.querySelectorAll<SVGPathElement>('.srd-segment .path')).map((path) =>
        path.getTotalLength()
      );

      // calculate the point where we want to display the label
      let labelPosition =
        lengths.reduce((previousValue, currentValue) => previousValue + currentValue, 0) *
        (index / (this.props.link.labels.length + 1));

      // find the path where the label will be rendered and calculate the relative position
      let pathIndex = 0;
      while (pathIndex < this.props.link.points.length - 1) {
        if (labelPosition - lengths[pathIndex] < 0) {
          return {
            path: this._elem.querySelector<SVGPathElement>(`.srd-segment[srd-index="${pathIndex}"] path.path`)!,
            position: labelPosition
          };
        }

        // keep searching
        labelPosition -= lengths[pathIndex];
        pathIndex++;
      }
    }

    return null;
  }

  calculateLabelPosition(label: LabelModel, index: number) {
    const labelElem = this._labelElems[label.id];
    if (!labelElem) {
      // no label? nothing to do here
      return;
    }

    const labelData = this.findPathAndRelativePositionToRenderLabel(index);
    if (labelData) {
      const labelDimensions = {
        width: labelElem.offsetWidth,
        height: labelElem.offsetHeight
      };

      const pathCentre = labelData.path.getPointAtLength(labelData.position);

      const labelCoordinates = {
        x: pathCentre.x - labelDimensions.width / 2 + label.offsetX,
        y: pathCentre.y - labelDimensions.height / 2 + label.offsetY
      };
      labelElem.setAttribute('style', `transform: translate(${labelCoordinates.x}px, ${labelCoordinates.y}px);`);
    }
  }

  /**
   * Smart routing is only applicable when all conditions below are true:
   * - smart routing is set to true on the engine
   * - current link is between two nodes (not between a node and an empty point)
   * - no custom points exist along the line
   */
  isSmartRoutingApplicable(): boolean {
    const { engine, link } = this.props;

    if (!engine.model.smartRouting) {
      return false;
    }

    if (link.points.length !== 2) {
      return false;
    }

    if (link.sourcePort === null || link.targetPort === null) {
      return false;
    }

    return true;
  }

  render() {
    const { link, engine } = this.props;

    // ensure id is present for all points on the path
    const paths: JSX.Element[] = [];

    if (this.isSmartRoutingApplicable()) {
      if (this._pathFinding) {
        // first step: calculate a direct path between the points being linked
        const directPathCoords = this._pathFinding.calculateDirectPath(link.firstPoint, link.lastPoint);

        const routingMatrix = engine.getRoutingMatrix();
        // now we need to extract, from the routing matrix, the very first walkable points
        // so they can be used as origin and destination of the link to be created
        const smartLink = this._pathFinding.calculateLinkStartEndCoords(routingMatrix, directPathCoords);

        if (smartLink) {
          const { start, end, pathToStart, pathToEnd } = smartLink;

          // second step: calculate a path avoiding hitting other elements
          const simplifiedPath = this._pathFinding.calculateDynamicPath(
            routingMatrix,
            start,
            end,
            pathToStart,
            pathToEnd
          );

          paths.push(this.generateSegment(engine, link, 0, Toolkit.generateDynamicPath(simplifiedPath)));
        }
      }
    }

    // true when smart routing was skipped or not enabled.
    // See @link{#isSmartRoutingApplicable()}.
    if (paths.length === 0) {
      if (link.points.length === 2) {
        paths.push(
          this.generateSegment(
            engine,
            link,
            0,
            Toolkit.generateCurvePath(link.firstPoint, link.lastPoint, link.curvyness, engine)
          )
        );

        // draw the link as dangeling
        if (link.targetPort === null) {
          paths.push(this.generatePoint(engine, link.lastPoint));
        }
      } else {
        // draw the multiple anchors and complex line instead
        for (let j = 0; j < link.points.length - 1; j++) {
          paths.push(
            this.generateSegment(engine, link, j, Toolkit.generateLinePath(link.points[j], link.points[j + 1], engine))
          );
        }

        // render only the middle points (not firstPoint and lastPoint)
        for (let i = 1; i < link.points.length - 1; i++) {
          paths.push(this.generatePoint(engine, link.points[i]));
        }

        // draw the dangeling point if link is not connected to a targetPort
        if (link.targetPort === null) {
          paths.push(this.generatePoint(engine, link.lastPoint));
        }
      }
    }

    const reverse = link.sourcePort && (link.sourcePort as DefaultPortModel).in;
    return (
      <g ref={(elem) => (this._elem = elem)} className={cx('srd-default-link', { reverse })}>
        {paths}
        {link.labels.map((labelModel) => this.generateLabel(labelModel))}
      </g>
    );
  }
}
