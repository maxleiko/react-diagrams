/// <reference types="react" />
import * as React from 'react';
import { DiagramEngine } from '../../DiagramEngine';
import { PointModel } from '../../models/PointModel';
import { DefaultLinkModel } from '../models/DefaultLinkModel';
import { LabelModel } from '../../models/LabelModel';
export interface DefaultLinkProps {
    color?: string;
    width?: number;
    smooth?: boolean;
    link: DefaultLinkModel;
    engine: DiagramEngine;
    pointAdded?: (point: PointModel, event: React.MouseEvent<HTMLElement>) => any;
}
export declare class DefaultLinkWidget extends React.Component<DefaultLinkProps> {
    static defaultProps: Partial<DefaultLinkProps>;
    private _elem;
    private _labelElems;
    private _pathFinding;
    constructor(props: DefaultLinkProps);
    calculateAllLabelPosition(): void;
    componentDidUpdate(): void;
    componentDidMount(): void;
    generateLabel(label: LabelModel): JSX.Element;
    generateSegment(engine: DiagramEngine, link: DefaultLinkModel, key: number, svgPath: string): JSX.Element;
    generatePoint(engine: DiagramEngine, point: PointModel): React.ReactElement<any>;
    findPathAndRelativePositionToRenderLabel(index: number): {
        path: SVGPathElement;
        position: number;
    } | null;
    calculateLabelPosition(label: LabelModel, index: number): void;
    /**
     * Smart routing is only applicable when all conditions below are true:
     * - smart routing is set to true on the engine
     * - current link is between two nodes (not between a node and an empty point)
     * - no custom points exist along the line
     */
    isSmartRoutingApplicable(): boolean;
    render(): JSX.Element;
}
