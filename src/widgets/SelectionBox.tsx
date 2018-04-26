import * as React from 'react';
import { observer } from 'mobx-react';

import { DiagramEngine } from '../DiagramEngine';
import { SelectingAction } from '../actions/SelectingAction';

export interface SelectionBoxProps {
  engine: DiagramEngine;
}

export const SelectionBox = observer(({ engine }: SelectionBoxProps) => {
  if (engine.action instanceof SelectingAction) {
    return <div className="selection-box" style={engine.action.styles} />;
  }
  return null;
});