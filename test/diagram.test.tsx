import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { DiagramEngine, DiagramWidget } from '../src/index';

describe('DiagramWidget', () => {
  it('renders correctly', () => {
    const engine = new DiagramEngine();
    const ui = renderer.create(<DiagramWidget engine={engine} />).toJSON();
    expect(ui).toMatchSnapshot();
  });
});
