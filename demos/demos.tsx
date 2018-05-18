import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '@leiko/react-diagrams/sass/main.scss';

import Simple from './simple-usage/simple';

import './styles.scss';

class Demos extends React.Component {
  render() {
    return (
      <Simple />
    );
  }
}

ReactDOM.render(
  <Demos />,
  document.getElementById('root') as HTMLElement
);