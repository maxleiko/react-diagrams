import * as _ from 'lodash';
import * as React from 'react';
import { DiagramEngine } from '../../DiagramEngine';
import { PointModel } from '../../models/PointModel';
import { LinkWidget } from '../LinkWidget';

export interface LinkLayerProps {
  diagramEngine: DiagramEngine;
  pointAdded: (point: PointModel, event: MouseEvent) => any;
}

/**
 * @author Dylan Vorster
 */
export class LinkLayerWidget extends React.Component<LinkLayerProps> {

  render() {
    const diagramModel = this.props.diagramEngine.model;
    return (
      <svg
        className="srd-link-layer"
        {...this.props}
        style={{
          transform:
            'translate(' +
            diagramModel.getOffsetX() +
            'px,' +
            diagramModel.getOffsetY() +
            'px) scale(' +
            diagramModel.getZoomLevel() / 100.0 +
            ')'
        }}
      >
        {// only perform these actions when we have a diagram
        this.props.diagramEngine.canvas &&
        Array.from(diagramModel.links.values()).map((link) => {
            if (
              this.props.diagramEngine.nodesRendered &&
              !this.props.diagramEngine.linksThatHaveInitiallyRendered[link.id]
            ) {
              if (link.sourcePort !== null) {
                try {
                  const portCenter = this.props.diagramEngine.getPortCenter(link.sourcePort);
                  if (portCenter) {
                    link.points[0].setPosition(portCenter.x, portCenter.y);
                  }

                  const portCoords = this.props.diagramEngine.getPortCoords(link.sourcePort);
                  if (portCoords) {
                    link.sourcePort.updateCoords(portCoords);
                  }

                  this.props.diagramEngine.linksThatHaveInitiallyRendered[link.id] = true;
                } catch (ignore) {
                  /*noop*/
                }
              }
              if (link.targetPort !== null) {
                try {
                  const portCenter = this.props.diagramEngine.getPortCenter(link.targetPort);
                  if (portCenter) {
                    const lastPoint = _.last(link.points);
                    if (lastPoint) {
                      lastPoint.setPosition(portCenter.x, portCenter.y);
                    }
  
                    const portCoords = this.props.diagramEngine.getPortCoords(link.targetPort);
                    if (portCoords) {
                      link.targetPort.updateCoords(portCoords);
                    }
  
                    this.props.diagramEngine.linksThatHaveInitiallyRendered[link.id] = true;
                  }
                } catch (ignore) {
                  /*noop*/
                }
              }
            }

            // generate links
            const generatedLink = this.props.diagramEngine.generateWidgetForLink(link);
            if (!generatedLink) {
              throw new Error(`no link generated for type: ${link.type}`);
            }

            return (
              <LinkWidget key={link.id} link={link} diagramEngine={this.props.diagramEngine}>
                {React.cloneElement(generatedLink, {
                  pointAdded: this.props.pointAdded
                })}
              </LinkWidget>
            );
          })}
      </svg>
    );
  }
}
