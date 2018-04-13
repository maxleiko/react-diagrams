import * as React from 'react';
import { observer } from 'mobx-react';
import { DiagramEngine } from '../../DiagramEngine';
import { LinkWidgetContainer } from '../LinkWidgetContainer';

export interface LinkLayerProps {
  engine: DiagramEngine;
}

const LinksLayer = observer(({ engine }: { engine: DiagramEngine }) => {
  return (
    <>
      {Array.from(engine.model.links.values()).map((link) => (
        <LinkWidgetContainer key={link.id} link={link}>
          {engine.generateWidgetForLink(link)}
        </LinkWidgetContainer>
      ))}
    </>
  );
});

@observer
export class LinkLayerWidget extends React.Component<LinkLayerProps> {
  render() {
    const { canvas } = this.props.engine;
    const { offsetX, offsetY, zoom } = this.props.engine.model;
    return (
      <svg
        className="srd-link-layer"
        style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom / 100.0})` }}
      >
        {canvas && <LinksLayer engine={this.props.engine} />}
      </svg>
    );
  }
}
