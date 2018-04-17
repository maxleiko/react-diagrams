import * as React from 'react';
import { DiagramEngine, DiagramModel, DefaultNodeModel, DiagramWidget } from 'storm-react-diagrams';
import { DemoWorkspace } from '../../DemoWorkspace';

/**
 * Tests the grid size
 */
class MutateGraphDemo extends React.Component {

  private engine: DiagramEngine = new DiagramEngine();

  constructor(props: {}) {
    super(props);

    this.updatePosition = this.updatePosition.bind(this);
    this.updatePositionViaSerialize = this.updatePositionViaSerialize.bind(this);
  }

  componentWillMount() {
    // 1) setup the diagram engine
    this.engine.installDefaultFactories();

    // 2) setup the diagram model
    const model = new DiagramModel();

    // 3-A) create a default node
    const node1 = new DefaultNodeModel('Node 1', 'rgb(0,192,255)');
    const port1 = node1.addOutPort('Out');
    node1.setPosition(100, 100);

    // 3-B) create another default node
    const node2 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
    const port2 = node2.addInPort('In');
    node2.setPosition(400, 100);

    // 3-C) link the 2 nodes together
    const link1 = port1.link(port2)!;

    // 4) add the models to the root graph
    model.addAll(node1, node2, link1);

    // 5) load model into engine
    this.engine.model = model;
  }

  updatePosition() {
    const nodes = this.engine.model.nodes;
    const node = nodes.values().next().value;
    node.setPosition(node.x + 30, node.y + 30);
    this.forceUpdate();
  }

  updatePositionViaSerialize() {
    const str = JSON.stringify(this.engine.model);
    const model2 = new DiagramModel();
    const obj = JSON.parse(str);
    const node = obj.nodes[0];
    node.x += 30;
    node.y += 30;
    model2.fromJSON(obj, this.engine);
    this.engine.model = model2;
  }

  render() {
    return (
      <DemoWorkspace
        header={[
          <button key={1} onClick={this.updatePosition}>
            Update position
          </button>,
          <button key={2} onClick={this.updatePositionViaSerialize}>
            Update position via serialize
          </button>
        ]}
      >
        <DiagramWidget engine={this.engine} />
      </DemoWorkspace>
    );
  }
}

export default () => <MutateGraphDemo />;