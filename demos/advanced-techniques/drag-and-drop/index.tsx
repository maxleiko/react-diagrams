import * as React from 'react';

import { BodyWidget } from './components/BodyWidget';
import { Application } from './Application';

import './sass/main.scss';

export default () => {
  const app = new Application();

  return <BodyWidget app={app} />;
};
