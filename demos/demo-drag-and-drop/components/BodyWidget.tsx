import * as React from 'react';
import { TrayWidget } from './TrayWidget';
import { Application } from '../Application';
import { TrayItemWidget } from './TrayItemWidget';
import { DefaultNodeModel, DiagramWidget } from 'storm-react-diagrams';

export interface BodyWidgetProps {
  app: Application;
}

/**
 * @author Dylan Vorster
 */
export class BodyWidget extends React.Component<BodyWidgetProps> {
  render() {
    return (
      <div className="body">
        <div className="header">
          <div className="title">Storm React Diagrams - Demo 5</div>
        </div>
        <div className="content">
          <TrayWidget>
            <TrayItemWidget model={{ type: 'in' }} name="In Node" color="rgb(192,255,0)" />
            <TrayItemWidget model={{ type: 'out' }} name="Out Node" color="rgb(0,192,255)" />
          </TrayWidget>
          <div
            className="diagram-layer"
            onDrop={(event) => {
              const data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
              const nodesCount = this.props.app.getDiagramEngine().model.nodes.size;

              let node = null;
              if (data.type === 'in') {
                node = new DefaultNodeModel('Node ' + (nodesCount + 1), 'rgb(192,255,0)');
                node.addInPort('In');
              } else {
                node = new DefaultNodeModel('Node ' + (nodesCount + 1), 'rgb(0,192,255)');
                node.addOutPort('Out');
              }
              const points = this.props.app.getDiagramEngine().getRelativeMousePoint(event);
              node.x = points.x;
              node.y = points.y;
              this.props.app.getDiagramEngine().model.addNode(node);
              this.forceUpdate();
            }}
            onDragOver={(event) => {
              event.preventDefault();
            }}
          >
            <DiagramWidget className="srd-demo-canvas" diagramEngine={this.props.app.getDiagramEngine()} />
          </div>
        </div>
      </div>
    );
  }
}
