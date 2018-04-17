/// <reference types="react" />
import * as React from 'react';
import { DefaultNodeModel } from '../models/DefaultNodeModel';
import { DiagramEngine } from '../../DiagramEngine';
export interface DefaultNodeProps {
    node: DefaultNodeModel;
    engine: DiagramEngine;
}
export declare class DefaultNodeWidget extends React.Component<DefaultNodeProps> {
    render(): JSX.Element;
}
