import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { Toolkit, DefaultLinkWidget, DiagramEngine, DefaultLinkModel } from '../../src/index';

Toolkit.TESTING = true;

describe('DefaultNodeWidget', () => {
  const engine = new DiagramEngine();
  engine.installDefaultFactories();

  it('with defaults', () => {
    const link = new DefaultLinkModel();
    const ui = renderer.create(<DefaultLinkWidget engine={engine} link={link} />).toJSON();
    expect(ui).toMatchSnapshot();
  });
});
