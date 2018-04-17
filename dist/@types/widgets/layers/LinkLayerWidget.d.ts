/// <reference types="react" />
import * as React from 'react';
import { DiagramEngine } from '../../DiagramEngine';
export interface LinkLayerProps {
    engine: DiagramEngine;
}
export declare class LinkLayerWidget extends React.Component<LinkLayerProps> {
    render(): JSX.Element;
}
