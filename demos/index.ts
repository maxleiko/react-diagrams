// @ts-ignore
import { storiesOf, addDecorator } from '@storybook/react';
// @ts-ignore
import { setOptions } from '@storybook/addon-options';
import { host } from 'storybook-host';
import { Toolkit } from '../src/Toolkit';
import { makeDemo } from './utils';

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
  addonPanelInRight: true
});

storiesOf('Simple Usage', module)
  .add('Simple example', makeDemo('simple-usage/simple'))
  .add('Simple flow example', makeDemo('simple-usage/flow'))
  .add('Performance demo', makeDemo('simple-usage/performance'))
  .add('Locked widget', makeDemo('simple-usage/locks'))
  .add('Canvas grid size', makeDemo('simple-usage/grid'))
  .add('Limiting link points', makeDemo('simple-usage/limit-points'))
  .add('Zoom to fit', makeDemo('simple-usage/zoom-to-fit'))
  .add('Links with labels', makeDemo('simple-usage/labelled-links'));

storiesOf('Advanced Techniques', module)
  .add('Clone Selected', makeDemo('advanced-techniques/cloning'))
  .add('Serializing and de-serializing', makeDemo('advanced-techniques/serializing'))
  .add('Programatically modifying graph', makeDemo('advanced-techniques/mutate-graph'))
  .add('Drag-n-Drop', makeDemo('advanced-techniques/drag-and-drop'))
  .add('Smart routing', makeDemo('advanced-techniques/smart-routing'));

storiesOf('Custom Models', module)
  .add('Custom diamond node', makeDemo('custom-models/custom-node'))
  .add('Custom animated links', makeDemo('custom-models/custom-link'));

storiesOf('3rd-party Libraries', module)
  .add('Auto Distribute (Dagre)', makeDemo('3rd-party/auto-distribute'));