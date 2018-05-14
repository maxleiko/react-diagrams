import * as React from 'react';
import addons from '@storybook/addons';

export interface WithCodeProps {
  code: string;
}

export class WithCode extends React.Component<WithCodeProps> {
  render() {
    const { children, code } = this.props;
    const channel = addons.getChannel();

    // send the notes to the channel.
    channel.emit('storybook/code/set_code', code);
    // return children elements.
    return children;
  }
}