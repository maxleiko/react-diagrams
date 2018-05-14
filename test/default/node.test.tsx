import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { Toolkit, DefaultNodeWidget, DiagramEngine, DefaultNodeModel } from '../../src/index';

Toolkit.TESTING = true;

describe('DefaultNodeWidget', () => {
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  it('with defaults', () => {
    const node = new DefaultNodeModel();
    const ui = renderer.create(<DefaultNodeWidget engine={engine} node={node} />).toJSON();
    expect(ui).toMatchSnapshot();
  });

  it('with a name', () => {
    const node = new DefaultNodeModel('foo');
    const ui = renderer.create(<DefaultNodeWidget engine={engine} node={node} />).toJSON();
    expect(ui).toMatchSnapshot();
  });

  it('with a name and color', () => {
    const node = new DefaultNodeModel('foo', '#012');
    const ui = renderer.create(<DefaultNodeWidget engine={engine} node={node} />).toJSON();
    expect(ui).toMatchSnapshot();
  });

  it('with an input port', () => {
    const node = new DefaultNodeModel();
    node.addInPort('input');
    const ui = renderer.create(<DefaultNodeWidget engine={engine} node={node} />).toJSON();
    expect(ui).toMatchSnapshot();
  });

  it('with an output port', () => {
    const node = new DefaultNodeModel();
    node.addOutPort('output');
    const ui = renderer.create(<DefaultNodeWidget engine={engine} node={node} />).toJSON();
    expect(ui).toMatchSnapshot();
  });

  it('with an input and an output port', () => {
    const node = new DefaultNodeModel();
    node.addInPort('input');
    node.addOutPort('output');
    const ui = renderer.create(<DefaultNodeWidget engine={engine} node={node} />).toJSON();
    expect(ui).toMatchSnapshot();
  });

  it('with 2 input ports', () => {
    const node = new DefaultNodeModel();
    node.addInPort('in0');
    node.addInPort('in1');
    const ui = renderer.create(<DefaultNodeWidget engine={engine} node={node} />).toJSON();
    expect(ui).toMatchSnapshot();
  });

  it('with 2 output ports', () => {
    const node = new DefaultNodeModel();
    node.addOutPort('out0');
    node.addOutPort('out1');
    const ui = renderer.create(<DefaultNodeWidget engine={engine} node={node} />).toJSON();
    expect(ui).toMatchSnapshot();
  });

  it('with 2 inputs and 4 outputs ports', () => {
    const node = new DefaultNodeModel();
    node.addInPort('in0');
    node.addInPort('in1');
    node.addOutPort('out0');
    node.addOutPort('out1');
    node.addOutPort('out2');
    node.addOutPort('out3');
    const ui = renderer.create(<DefaultNodeWidget engine={engine} node={node} />).toJSON();
    expect(ui).toMatchSnapshot();
  });
});
