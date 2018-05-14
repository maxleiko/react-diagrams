import * as React from 'react';
import addons from '@storybook/addons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/styles/hljs';

export interface CodePreviewProps {
  code?: string;
  channel: any;
  api: any;
}

/**
 *
 * Simple little addon for displaying code, might make this a seperate project at some point
 */
export class CodePreview extends React.Component<CodePreviewProps, { code: string }> {

  private stopListeningOnStory: any;

  constructor(props: CodePreviewProps) {
    super(props);
    this.state = { code: '' };
  }

  componentDidMount() {
    const { channel, api } = this.props;
    // Listen to the notes and render it.
    channel.on('storybook/code/set_code', (code: any) => this.onAddCode(code));

    // Clear the current notes on every story change.
    this.stopListeningOnStory = api.onStory(() => this.onAddCode(''));
  }

  // This is some cleanup tasks when the Notes panel is unmounting.
  componentWillUnmount() {
    if (this.stopListeningOnStory) {
      this.stopListeningOnStory();
    }

    const { channel } = this.props;
    channel.removeListener('storybook/notes/add_notes', this.onAddCode);
  }

  onAddCode(code: string) {
    this.setState({ code });
  }

  render() {
    return (
      <SyntaxHighlighter
        customStyle={{ width: '100%', overflowX: 'hidden', tabSize: 4 }}
        showLineNumbers={true}
        language="language-tsx"
        style={github}
      >
        {this.state.code}
      </SyntaxHighlighter>
    );
  }
}

// Register the addon with a unique name.
addons.register('storybook/code', (api: any) => {
  // Also need to set a unique name to the panel.
  addons.addPanel('storybook/code/panel', {
    title: 'Code preview',
    render: () => <CodePreview channel={addons.getChannel()} api={api} />
  });
});
