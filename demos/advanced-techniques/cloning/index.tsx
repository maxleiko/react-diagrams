import * as React from 'react';
import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  LinkModel,
  NodeModel,
  DiagramWidget,
} from 'storm-react-diagrams';
import { DemoWorkspace } from '../../DemoWorkspace';

class CloneSelectedDemo extends React.Component {

  private engine = new DiagramEngine();

  constructor(props: {}) {
    super(props);
    this.cloneSelected = this.cloneSelected.bind(this);
  }

  componentWillMount() {
    // 1) setup the diagram engine
    this.engine.installDefaultFactories();

    // 2) setup the diagram model
    const model = new DiagramModel();

    // 3-A) create a default node
    const node1 = new DefaultNodeModel('Node 1', 'rgb(0,192,255)');
    const port = node1.addOutPort('Out');
    node1.setPosition(100, 100);

    // 3-B) create another default node
    const node2 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
    const port2 = node2.addInPort('In');
    node2.setPosition(400, 100);

    // 3-C) link the ports
    const link = port.link(port2);

    // 4) add the models to the root graph
    model.addAll(node1, node2, link);

    // 5) load model into engine
    this.engine.model = model;
  }

  cloneSelected() {
    const offset = { x: 100, y: 100 };

    const lookupTable = {};
    this.engine.model.selectedEntities.forEach((item) => {
      const newItem = item.clone(lookupTable);

      // offset the nodes slightly
      if (newItem instanceof NodeModel) {
        newItem.setPosition(newItem.x + offset.x, newItem.y + offset.y);
        this.engine.model.addNode(newItem);
      } else if (newItem instanceof LinkModel) {
        // offset the link points
        newItem.points.forEach((p) => {
          p.setPosition(p.x + offset.x, p.y + offset.y);
        });
        this.engine.model.addLink(newItem);
      }
      newItem.selected = false;
    });
  }

  render() {
    return (
      <DemoWorkspace header={<button onClick={this.cloneSelected}>Clone Selected</button>}>
        <DiagramWidget engine={this.engine} />
      </DemoWorkspace>
    );
  }
}

export default () => <CloneSelectedDemo />;
