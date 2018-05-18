import { configure } from '@storybook/react';

const demos = require('../demos');

configure(() => {
  return demos;
}, module);