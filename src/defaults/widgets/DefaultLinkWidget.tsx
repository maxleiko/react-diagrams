import * as React from 'react';
import * as cx from 'classnames';
import { DiagramEngine } from '../../DiagramEngine';
import { PointModel } from '../../models/PointModel';
import { Toolkit } from '../../Toolkit';
import { DefaultLinkModel } from '../models/DefaultLinkModel';
import { PathFinding } from '../../routing/PathFinding';
import * as _ from 'lodash';
import { LabelModel } from '../../models/LabelModel';

export interface DefaultLinkProps {
  color?: string;
  width?: number;
  smooth?: boolean;
  link: DefaultLinkModel;
  diagramEngine: DiagramEngine;
  pointAdded?: (point: PointModel, event: React.MouseEvent<HTMLElement>) => any;
}

export interface DefaultLinkState {
  selected: boolean;
}

export class DefaultLinkWidget extends React.Component<DefaultLinkProps, DefaultLinkState> {
  static defaultProps: Partial<DefaultLinkProps> = {
    color: 'black',
    width: 3,
    smooth: false
  };

  // DOM references to the label and paths (if label is given), used to calculate dynamic positioning
  refLabels: { [id: string]: HTMLElement | null };
  refPaths: SVGPathElement[];

  pathFinding: PathFinding | null = null; // only set when smart routing is active

  constructor(props: DefaultLinkProps) {
    super(props);

    this.refLabels = {};
    this.refPaths = [];
    this.state = {
      selected: false
    };

    if (props.diagramEngine.isSmartRoutingEnabled()) {
      this.pathFinding = new PathFinding(this.props.diagramEngine);
    }

    this.select = this.select.bind(this);
    this.unselect = this.unselect.bind(this);
    this.addPointToLink = this.addPointToLink.bind(this);
    this.calculateLabelPosition = this.calculateLabelPosition.bind(this);
    this.findPathAndRelativePositionToRenderLabel = this.findPathAndRelativePositionToRenderLabel.bind(this);
  }

  calculateAllLabelPosition() {
    _.forEach(this.props.link.labels, (label, index) => {
      this.calculateLabelPosition(label, index + 1);
    });
  }

  componentDidUpdate() {
    if (this.props.link.labels.length > 0) {
      window.requestAnimationFrame(this.calculateAllLabelPosition.bind(this));
    }
  }

  componentDidMount() {
    if (this.props.link.labels.length > 0) {
      window.requestAnimationFrame(this.calculateAllLabelPosition.bind(this));
    }
  }

  addPointToLink(event: React.MouseEvent<HTMLElement>, index: number) {
    if (
      !event.shiftKey &&
      !this.props.diagramEngine.isModelLocked(this.props.link) &&
      this.props.link.points.length - 1 <= this.props.diagramEngine.getMaxNumberPointsPerLink()
    ) {
      const point = new PointModel(this.props.link, this.props.diagramEngine.getRelativeMousePoint(event));
      point.selected = true;
      this.forceUpdate();
      this.props.link.addPoint(point, index);
      if (this.props.pointAdded) {
        this.props.pointAdded(point, event);
      }
    }
  }

  select() {
    this.setState({ selected: true });
  }

  unselect() {
    this.setState({ selected: false });
  }

  generatePoint(pointIndex: number): JSX.Element {
    const x = this.props.link.points[pointIndex].x;
    const y = this.props.link.points[pointIndex].y;

    return (
      <g key={'point-' + this.props.link.points[pointIndex].id}>
        <circle
          cx={x}
          cy={y}
          r={5}
          className={cx(
            'srd-point',
            { selected: this.props.link.points[pointIndex].selected }
          )}
        />
        <circle
          onMouseEnter={this.select}
          onMouseLeave={this.unselect}
          srd-id={this.props.link.points[pointIndex].id}
          cx={x}
          cy={y}
          r={15}
          opacity={0}
          className="srd-point"
        />
      </g>
    );
  }

  generateLabel(label: LabelModel) {
    const canvas = this.props.diagramEngine.canvas as HTMLElement;
    const factory = this.props.diagramEngine.getFactoryForLabel(label);
    if (factory) {
      return (
        <foreignObject
          key={label.id}
          className="label"
          width={canvas.offsetWidth}
          height={canvas.offsetHeight}
        >
          <div ref={(ref) => (this.refLabels[label.id] = ref)}>
            {factory.generateReactWidget(this.props.diagramEngine, label)}
          </div>
        </foreignObject>
      );
    }
    throw new Error(`Unable to find a Label factory for "${label}"`);
  }

  generateLink(path: string, extraProps: any, id: string | number): JSX.Element {
    const props = this.props;
    const factory = props.diagramEngine.getFactoryForLink(this.props.link);
    const linkEl = factory.generateLinkSegment(this.props.link, this.state.selected || this.props.link.selected, path);
    const Bottom = React.cloneElement(linkEl, { ref: (ref: any) => ref && this.refPaths.push(ref) });
    const Top = React.cloneElement(Bottom, {
      ...extraProps,
      strokeLinecap: 'round',
      onMouseLeave: () => {
        this.setState({ selected: false });
      },
      onMouseEnter: () => {
        this.setState({ selected: true });
      },
      ref: null,
      'srd-id': this.props.link.id,
      strokeOpacity: this.state.selected ? 0.1 : 0,
      strokeWidth: 20,
      onContextMenu: (event: React.MouseEvent<any>) => {
        if (!this.props.diagramEngine.isModelLocked(this.props.link)) {
          event.preventDefault();
          this.props.link.remove();
        }
      }
    });

    return (
      <g key={'link-' + id}>
        {Bottom}
        {Top}
      </g>
    );
  }

  findPathAndRelativePositionToRenderLabel(index: number) {
    // an array to hold all path lengths, making sure we hit the DOM only once to fetch this information
    const lengths = this.refPaths.map((path) => path.getTotalLength());

    // calculate the point where we want to display the label
    let labelPosition =
      lengths.reduce((previousValue, currentValue) => previousValue + currentValue, 0) *
      (index / (this.props.link.labels.length + 1));

    // find the path where the label will be rendered and calculate the relative position
    let pathIndex = 0;
    while (pathIndex < this.refPaths.length) {
      if (labelPosition - lengths[pathIndex] < 0) {
        return {
          path: this.refPaths[pathIndex],
          position: labelPosition
        };
      }

      // keep searching
      labelPosition -= lengths[pathIndex];
      pathIndex++;
    }

    return null;
  }

  calculateLabelPosition(label: LabelModel, index: number) {
    const labelRef = this.refLabels[label.id];
    if (!labelRef) {
      // no label? nothing to do here
      return;
    }

    const labelData = this.findPathAndRelativePositionToRenderLabel(index);
    if (labelData) {
      const labelDimensions = {
        width: labelRef.offsetWidth,
        height: labelRef.offsetHeight
      };

      const pathCentre = labelData.path.getPointAtLength(labelData.position);

      const labelCoordinates = {
        x: pathCentre.x - labelDimensions.width / 2 + label.offsetX,
        y: pathCentre.y - labelDimensions.height / 2 + label.offsetY
      };
      labelRef.setAttribute('style', `transform: translate(${labelCoordinates.x}px, ${labelCoordinates.y}px);`);
    }
  }

  /**
   * Smart routing is only applicable when all conditions below are true:
   * - smart routing is set to true on the engine
   * - current link is between two nodes (not between a node and an empty point)
   * - no custom points exist along the line
   */
  isSmartRoutingApplicable(): boolean {
    const { diagramEngine, link } = this.props;

    if (!diagramEngine.isSmartRoutingEnabled()) {
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
    const { diagramEngine } = this.props;
    if (!diagramEngine.nodesRendered) {
      return null;
    }

    // ensure id is present for all points on the path
    const points = this.props.link.points;
    const paths = [];

    if (this.isSmartRoutingApplicable()) {
      if (this.pathFinding) {
        if (points.length > 1) {
          // first step: calculate a direct path between the points being linked
          const directPathCoords = this.pathFinding.calculateDirectPath(_.first(points)!, _.last(points)!);

          const routingMatrix = diagramEngine.getRoutingMatrix();
          // now we need to extract, from the routing matrix, the very first walkable points
          // so they can be used as origin and destination of the link to be created
          const smartLink = this.pathFinding.calculateLinkStartEndCoords(routingMatrix, directPathCoords);

          if (smartLink) {
            const { start, end, pathToStart, pathToEnd } = smartLink;

            // second step: calculate a path avoiding hitting other elements
            const simplifiedPath = this.pathFinding.calculateDynamicPath(
              routingMatrix,
              start,
              end,
              pathToStart,
              pathToEnd
            );

            paths.push(
              // smooth: boolean, extraProps: any, id: string | number, firstPoint: PointModel, lastPoint: PointModel
              this.generateLink(
                Toolkit.generateDynamicPath(simplifiedPath),
                { onMouseDown: (event: React.MouseEvent<HTMLElement>) => this.addPointToLink(event, 1) },
                '0'
              )
            );
          }
        }
      }
    }

    // true when smart routing was skipped or not enabled.
    // See @link{#isSmartRoutingApplicable()}.
    if (paths.length === 0) {
      if (points.length === 2) {
        paths.push(
          this.generateLink(
            Toolkit.generateCurvePath(points[0], points[1], this.props.link.curvyness),
            { onMouseDown: (event: React.MouseEvent<any>) => this.addPointToLink(event, 1) },
            '0'
          )
        );

        // draw the link as dangeling
        if (this.props.link.targetPort === null) {
          paths.push(this.generatePoint(1));
        }
      } else {
        // draw the multiple anchors and complex line instead
        for (let j = 0; j < points.length - 1; j++) {
          paths.push(
            this.generateLink(
              Toolkit.generateLinePath(points[j], points[j + 1]),
              {
                'srd-id': this.props.link.id,
                'data-point': j,
                onMouseDown: (event: React.MouseEvent<any>) => {
                  this.addPointToLink(event, j + 1);
                }
              },
              j
            )
          );
        }

        // render the circles
        for (let i = 1; i < points.length - 1; i++) {
          paths.push(this.generatePoint(i));
        }

        if (this.props.link.targetPort === null) {
          paths.push(this.generatePoint(points.length - 1));
        }
      }
    }

    this.refPaths = [];
    return (
      <g className="srd-default-link">
        {paths}
        {this.props.link.labels.map((labelModel) => this.generateLabel(labelModel))}
      </g>
    );
  }
}
