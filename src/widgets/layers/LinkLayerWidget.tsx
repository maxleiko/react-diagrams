import * as React from 'react';
import { observer } from 'mobx-react';
import { DiagramEngine } from '../../DiagramEngine';
import { PointModel } from '../../models/PointModel';
import { PortModel } from '../../models/PortModel';
import { LinkWidgetContainer } from '../LinkWidgetContainer';

export interface LinkLayerProps {
  engine: DiagramEngine;
}

/**
 * @author Dylan Vorster
 */
@observer
export class LinkLayerWidget extends React.Component<LinkLayerProps> {
  centerPointInPort(point: PointModel, port: PortModel) {
    const portCenter = this.props.engine.getPortCenter(port);
    if (portCenter) {
      point.setPosition(portCenter.x, portCenter.y);
    }

    const portCoords = this.props.engine.getPortCoords(port);
    if (portCoords) {
      port.updateCoords(portCoords);
    }
  }

  render() {
    const { links, offsetX, offsetY, zoom } = this.props.engine.model;
    return (
      <svg
        className="srd-link-layer"
        style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom / 100.0})` }}
      >
        {// only perform these actions when we have a diagram
        this.props.engine.canvas &&
          Array.from(links.values()).map((link) => {
            if (link.sourcePort && link.firstPoint) {
              this.centerPointInPort(link.firstPoint, link.sourcePort);
            }
            if (link.targetPort && link.lastPoint) {
              this.centerPointInPort(link.lastPoint, link.targetPort);
            }

            return (
              <LinkWidgetContainer key={link.id} link={link}>
                {this.props.engine.generateWidgetForLink(link)}
              </LinkWidgetContainer>
            );
          })}
      </svg>
    );
  }
}
