/// <reference types="react" />
import * as React from 'react';
import { PortModel } from '../models/PortModel';
import { DiagramEngine } from '../DiagramEngine';
export interface PortProps {
    port: PortModel;
    engine: DiagramEngine;
}
export declare class PortWidgetContainer extends React.Component<PortProps> {
    private _elem;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
