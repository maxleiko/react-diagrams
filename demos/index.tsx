// @ts-ignore
import { storiesOf, addDecorator } from '@storybook/react';
// @ts-ignore
import { setOptions } from '@storybook/addon-options';
import { host } from 'storybook-host';
import { Helper } from './.helpers/Helper';
import { Toolkit } from '../src/Toolkit';

// include the SCSS for the demo
import './.helpers/demo.scss';

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
  .add(
    'Simple example',
    Helper.makeDemo(
      require('./demo-simple').default(),
      require('!!raw-loader!./demo-simple'),
      require('./demo-simple/docs.md')
    )
  )
  .add(
    'Simple flow example',
    Helper.makeDemo(require('./demo-simple-flow').default(), require('!!raw-loader!./demo-simple-flow'))
  )
  .add(
    'Performance demo',
    Helper.makeDemo(require('./demo-performance').default(), require('!!raw-loader!./demo-performance'))
  )
  .add('Locked widget', Helper.makeDemo(require('./demo-locks').default(), require('!!raw-loader!./demo-locks')))
  .add('Canvas grid size', Helper.makeDemo(require('./demo-grid').default(), require('!!raw-loader!./demo-grid')))
  .add(
    'Limiting link points',
    Helper.makeDemo(require('./demo-limit-points').default(), require('!!raw-loader!./demo-limit-points'))
  )
  .add(
    'Zoom to fit',
    Helper.makeDemo(require('./demo-zoom-to-fit').default(), require('!!raw-loader!./demo-zoom-to-fit'))
  )
  .add(
    'Links with labels',
    Helper.makeDemo(require('./demo-labelled-links').default(), require('!!raw-loader!./demo-labelled-links'))
  );

storiesOf('Advanced Techniques', module)
.add('Clone Selected', Helper.makeDemo(require('./demo-cloning').default(), require('!!raw-loader!./demo-cloning')))
  .add(
    'Serializing and de-serializing',
    Helper.makeDemo(require('./demo-serializing').default(), require('!!raw-loader!./demo-serializing'))
  )
  .add(
    'Programatically modifying graph',
    Helper.makeDemo(require('./demo-mutate-graph').default(), require('!!raw-loader!./demo-mutate-graph'))
  )
  .add(
    'Large application',
    Helper.makeDemo(
      require('./demo-drag-and-drop').default(),
      require('!!raw-loader!./demo-drag-and-drop/components/BodyWidget')
    )
  )
  .add(
    'Smart routing',
    Helper.makeDemo(require('./demo-smart-routing').default(), require('!!raw-loader!./demo-smart-routing'))
  );

storiesOf('Custom Models', module)
  .add(
    'Custom diamond node',
    Helper.makeDemo(require('./demo-custom-node1').default(), require('!!raw-loader!./demo-custom-node1'))
  )
  .add(
    'Custom animated links',
    Helper.makeDemo(require('./demo-custom-link1').default(), require('!!raw-loader!./demo-custom-link1'))
  );

storiesOf('3rd party libraries', module).add(
  'Auto Distribute (Dagre)',
  Helper.makeDemo(require('./demo-dagre').default(), require('!!raw-loader!./demo-dagre'))
);

// enable this to log mouse location when writing new puppeteer tests
