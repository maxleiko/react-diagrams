/// <reference types="react" />
import * as React from 'react';
import { DiamondNodeModel } from './DiamondNodeModel';
import { DiagramEngine } from 'storm-react-diagrams';
export interface DiamonNodeWidgetProps {
    node: DiamondNodeModel;
    engine: DiagramEngine;
    size?: number;
}
/**
 * @author Dylan Vorster
 */
export declare class DiamonNodeWidget extends React.Component<DiamonNodeWidgetProps> {
    static defaultProps: Partial<DiamonNodeWidgetProps>;
    render(): JSX.Element;
}
