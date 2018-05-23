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

import AutoDistribute from './3rd-party/auto-distribute';

import CustomLink from './custom-models/custom-link';
import CustomNode from './custom-models/custom-node';

import './styles.scss';

interface DemosState {
  demo: string;
}

interface SelectOption {
  name: string;
  disabled?: boolean;
}

const DEMOS: Array<SelectOption & { component?: () => JSX.Element }> = [
  { name: 'simple-usage/simple', component: Simple },
  { name: 'simple-usage/ports', component: Ports },
  { name: 'simple-usage/grid', component: Grid },
  { name: 'simple-usage/labelled-links', component: LabelledLinks },
  { name: 'simple-usage/limit-points', component: LimitPoints },
  { name: 'simple-usage/lock-features', component: LockFeatures },
  { name: 'simple-usage/performance', component: Performance },
  { name: '------------------------', disabled: true },
  { name: 'advanced-techniques/change-model', component: ChangeModel },
  { name: 'advanced-techniques/drag-n-drop', component: DragNDrop },
  { name: 'advanced-techniques/mutate-graph', component: MutateGraph },
  { name: 'advanced-techniques/serializing', component: Serializing },
  { name: 'advanced-techniques/smart-routing', component: SmartRouting },
  { name: '------------------------', disabled: true },
  { name: '3rd-party/auto-distribute', component: AutoDistribute },
  { name: '------------------------', disabled: true },
  { name: 'custom-models/custom-link', component: CustomLink },
  { name: 'custom-models/custom-node', component: CustomNode },
];

class Demos extends React.Component<{}, DemosState> {

  constructor(props: {}) {
    super(props);
    this.state = { demo: 'simple-usage/simple' };
  }

  onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ demo: e.target.value });
  }

  render() {
    const demo = DEMOS.find((d) => d.name === this.state.demo);
    if (!demo || !demo.component) {
      throw new Error(`Unable to locate demo "${this.state.demo}" or no component is associated with it.`);
    }

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
                {DEMOS.map(({ name, disabled }, i) => (
                  <option key={i} value={name} disabled={disabled}>{name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="demo">
            <demo.component />
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