/// <reference types="react" />
import * as React from 'react';
import { DiagramEngine } from '../../DiagramEngine';
export interface NodeLayerProps {
    engine: DiagramEngine;
}
export declare class NodeLayerWidget extends React.Component<NodeLayerProps> {
    componentDidUpdate(): void;
    render(): JSX.Element;
}
