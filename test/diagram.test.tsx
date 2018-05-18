import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { Toolkit, DiagramEngine, DiagramWidget, DefaultNodeModel } from '../src/index';

Toolkit.TESTING = true;

describe('DiagramWidget', () => {
  it('empty model', () => {
    const engine = new DiagramEngine();
    const ui = renderer.create(<DiagramWidget engine={engine} />).toJSON();
    expect(ui).toMatchSnapshot();
  });

  it('places nodes correctly', () => {
    const engine = new DiagramEngine();
    engine.installDefaultFactories();
    const node0 = new DefaultNodeModel('node0');
    node0.setPosition(150, 200);
    const node1 = new DefaultNodeModel('node1');
    node1.setPosition(300, 400);
    engine.model.addNode(node0);
    engine.model.addNode(node1);

    const ui = renderer.create(<DiagramWidget engine={engine} />).toJSON();
    expect(ui).toMatchSnapshot();
  });

  it('places ports correctly', () => {
    const engine = new DiagramEngine();
    engine.installDefaultFactories();
    const node0 = new DefaultNodeModel('node0');
    node0.addOutPort('out');
    const node1 = new DefaultNodeModel('node1');
    node1.addInPort('in');
    engine.model.addNode(node0);
    engine.model.addNode(node1);

    const ui = renderer.create(<DiagramWidget engine={engine} />).toJSON();
    expect(ui).toMatchSnapshot();
  });
});
