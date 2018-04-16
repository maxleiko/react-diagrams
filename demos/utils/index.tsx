import * as React from 'react';
// @ts-ignore
import { withDocs } from 'storybook-readme';
// @ts-ignore
import { WithCode } from '../../.storybook/addon-code/react';

/**
 * Logs the mouse position in the console, but overlays a div that consumes all events
 * since the actual story book stories are rendered as an iFrame.
 */
export function logMousePosition() {
  const element = window.parent.document.createElement('mouse-position');
  element.style.position = 'absolute';
  element.style.top = '0px';
  element.style.left = '0px';
  element.style.bottom = '0px';
  element.style.right = '0px';
  element.style.zIndex = '10';
  window.parent.document.body.appendChild(element);

  window.parent.window.addEventListener('mousemove', (event) => {
    console.clear();
    console.log(event.clientX, event.clientY);
  });
}

export function makeDemo(demoPath: string): () => JSX.Element {
  try {
    const demo = require('../' + demoPath).default();
    const code = require(`!!raw-loader!../${demoPath}`);

    const demoWithCode = () => <WithCode code={code}>{demo}</WithCode>;

    try {
      const docs = require('../' + demoPath + '/docs.md');
      return withDocs({
        PreviewComponent: ({ children }: any) => {
          return <div className="docs-preview-wrapper">{children}</div>;
        }
      })(docs, demoWithCode);
    } catch {
      return demoWithCode;
    }
  } catch (err) {
    throw new Error(`Unable to load demo "${demoPath}"`);
  }
}