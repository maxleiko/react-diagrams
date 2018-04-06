import * as React from 'react';
import { DiagramEngine } from '../../DiagramEngine';
import { PointModel } from '../../models/PointModel';
import { PortModel } from '../../models/PortModel';
import { LinkWidget } from '../LinkWidget';

export interface LinkLayerProps {
  diagramEngine: DiagramEngine;
  pointAdded: (point: PointModel, event: MouseEvent) => any;
}

/**
 * @author Dylan Vorster
 */
export class LinkLayerWidget extends React.Component<LinkLayerProps> {
  centerPointInPort(point: PointModel, port: PortModel) {
    const portCenter = this.props.diagramEngine.getPortCenter(port);
    if (portCenter) {
      point.setPosition(portCenter.x, portCenter.y);
    }

    const portCoords = this.props.diagramEngine.getPortCoords(port);
    if (portCoords) {
      port.updateCoords(portCoords);
    }

    this.props.diagramEngine.linksThatHaveInitiallyRendered[point.parent!.id] = true;
  }

  render() {
    const { links, offsetX, offsetY, zoom } = this.props.diagramEngine.model;
    return (
      <svg
        className="srd-link-layer"
        style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom / 100.0})` }}
      >
        {// only perform these actions when we have a diagram
        this.props.diagramEngine.canvas &&
          Array.from(links.values()).map((link) => {
            if (
              this.props.diagramEngine.nodesRendered &&
              !this.props.diagramEngine.linksThatHaveInitiallyRendered[link.id]
            ) {
              if (link.sourcePort) {
                this.centerPointInPort(link.getFirstPoint(), link.sourcePort);
              }
              if (link.targetPort) {
                this.centerPointInPort(link.getLastPoint(), link.targetPort);
              }
            }

            return (
              <LinkWidget key={link.id} link={link} diagramEngine={this.props.diagramEngine}>
                {this.props.diagramEngine.generateWidgetForLink(link)}
              </LinkWidget>
            );
          })}
      </svg>
    );
  }
}
