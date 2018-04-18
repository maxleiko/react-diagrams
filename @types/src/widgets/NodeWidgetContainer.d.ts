/// <reference types="react" />
import * as React from 'react';
import { NodeModel } from '../models/NodeModel';
export interface NodeProps {
    node: NodeModel;
}
export declare class NodeWidgetContainer extends React.Component<NodeProps> {
    private _elem;
    componentDidMount(): void;
    render(): JSX.Element;
}
