import * as React from 'react';
import { withDocs } from 'storybook-readme';
import { storiesOf, addDecorator } from '@storybook/react';
import { setOptions } from '@storybook/addon-options';
import { host } from 'storybook-host';

import { WithCode } from './WithCode';
import { Toolkit } from '../src/Toolkit';

// include the SCSS for the demo
import './styles.scss';

Toolkit.TESTING = true;

addDecorator(
  host({
    cropMarks: false,
    height: '100%',
    width: '100%',
    padding: 20
  })
);

setOptions({
  name: 'STORM React Diagrams',
  url: 'https://github.com/projectstorm/react-diagrams',
});

const withCustomDocs = withDocs({
  PreviewComponent: ({ children }: any) => (
    <div className="docs-preview-wrapper">{children}</div>
  )
});

function makeStory(demoPath: string): () => JSX.Element {
  let demo: any;
  let code: any;
  let docs: any;

  try {
    demo = require('./' + demoPath).default();
    docs = require('./' + demoPath + '/readme.md');
    code = require(`!!raw-loader!./${demoPath}`);
  } catch (err) {
    console.error(err.stack);
    throw new Error(`Unable to load demo "${demoPath}"`);
  }

  return withCustomDocs(docs, () => <WithCode code={code}>{demo}</WithCode>);
}

storiesOf('Simple Usage', module)
  .add('Simple example', makeStory('simple-usage/simple'))
  .add('Node\'s ports', makeStory('simple-usage/ports'))
  .add('Performance test', makeStory('simple-usage/performance'))
  .add('Lock features', makeStory('simple-usage/lock-features'))
  .add('Canvas grid size', makeStory('simple-usage/grid'))
  .add('Limiting link points', makeStory('simple-usage/limit-points'))
  .add('Fit content', makeStory('simple-usage/fit-content'))
  .add('Links with labels', makeStory('simple-usage/labelled-links'));

storiesOf('Advanced Techniques', module)
  .add('(De-)Serializing', makeStory('advanced-techniques/serializing'))
  .add('Mutate graph', makeStory('advanced-techniques/mutate-graph'))
  .add('Drag-n-Drop', makeStory('advanced-techniques/drag-n-drop'))
  .add('Smart routing', makeStory('advanced-techniques/smart-routing'))
  .add('Change model', makeStory('advanced-techniques/change-model'));

storiesOf('Custom Models', module)
  .add('Custom diamond node', makeStory('custom-models/custom-node'))
  .add('Custom animated links', makeStory('custom-models/custom-link'));

storiesOf('3rd-party Libraries', module)
  .add('Auto Distribute (Dagre)', makeStory('3rd-party/auto-distribute'));