import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Simple from './simple-usage/simple';
import Ports from './simple-usage/ports';
import Grid from './simple-usage/grid';
import LabelledLinks from './simple-usage/labelled-links';
import LimitPoints from './simple-usage/limit-points';
import LockFeatures from './simple-usage/lock-features';
import Performance from './simple-usage/performance';

import ChangeModel from './advanced-techniques/change-model';
import DragNDrop from './advanced-techniques/drag-n-drop';
import MutateGraph from './advanced-techniques/mutate-graph';
import Serializing from './advanced-techniques/serializing';
import SmartRouting from './advanced-techniques/smart-routing';

import './styles.scss';

interface DemosState {
  demo: string;
}

const DEMOS: { [s: string]: React.ComponentType<any> } = {
  'simple-usage/simple': Simple,
  'simple-usage/ports': Ports,
  'simple-usage/grid': Grid,
  'simple-usage/labelled-links': LabelledLinks,
  'simple-usage/limit-points': LimitPoints,
  'simple-usage/lock-features': LockFeatures,
  'simple-usage/performance': Performance,
  // -------------------------------------
  'advanced-techniques/change-model': ChangeModel,
  'advanced-techniques/drag-n-drop': DragNDrop,
  'advanced-techniques/mutate-graph': MutateGraph,
  'advanced-techniques/serializing': Serializing,
  'advanced-techniques/smart-routing': SmartRouting,
};

class Demos extends React.Component<{}, DemosState> {

  constructor(props: {}) {
    super(props);
    this.state = { demo: 'simple-usage/simple' };
  }

  onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ demo: e.target.value });
  }

  render() {
    const DemoComponent = DEMOS[this.state.demo];

    return (
      <div className="demos">
        <h2>Demos for <code>@leiko/react-diagrams</code></h2>
        <div className="demo-container">
          <div className="header">
            <div>
              <strong>Current demo: </strong><code>{this.state.demo}</code>
            </div>
            <div>
              <label htmlFor="selector">Select a demo: </label>
              <select name="selector" onChange={(e) => this.onChange(e)}>
                {Object.keys(DEMOS).map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="demo">
            <DemoComponent />
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Demos />,
  document.getElementById('root') as HTMLElement
);