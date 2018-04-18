/// <reference types="react" />
import { DefaultPortModel, DefaultLinkModel, DefaultLinkFactory } from 'storm-react-diagrams';
import * as React from 'react';
export declare class AdvancedLinkModel extends DefaultLinkModel {
    constructor();
}
export declare class AdvancedPortModel extends DefaultPortModel {
    createLinkModel(): AdvancedLinkModel | null;
}
export interface AdvancedLinkSegmentProps {
    model: AdvancedLinkModel;
    path: string;
}
export declare class AdvancedLinkSegment extends React.Component<AdvancedLinkSegmentProps> {
    percent: number;
    path: SVGPathElement | null;
    handle: any;
    circle: SVGCircleElement | null;
    mounted: boolean;
    callback: () => any;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
export declare class AdvancedLinkFactory extends DefaultLinkFactory {
    constructor();
    getNewInstance(_initialConfig?: any): AdvancedLinkModel;
    generateLinkSegment(model: AdvancedLinkModel, _selected: boolean, path: string): JSX.Element;
}
declare const _default: () => JSX.Element;
export default _default;
