/// <reference types="react" />
import * as React from 'react';
import { DefaultPortModel } from '../models/DefaultPortModel';
import { DiagramEngine } from '../../DiagramEngine';
export interface DefaultPortWidgetProps {
    port: DefaultPortModel;
    engine: DiagramEngine;
}
export declare class DefaultPortWidget extends React.Component<DefaultPortWidgetProps> {
    render(): JSX.Element;
}
