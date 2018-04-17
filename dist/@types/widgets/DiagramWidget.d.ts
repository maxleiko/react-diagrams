/// <reference types="react" />
import * as React from 'react';
import { DiagramEngine } from '../DiagramEngine';
import { BaseAction } from '../actions/BaseAction';
import { BaseModel } from '../models/BaseModel';
export interface DiagramProps {
    engine: DiagramEngine;
    actionStartedFiring?: (action: BaseAction) => boolean;
    actionStillFiring?: (action: BaseAction) => void;
    actionStoppedFiring?: (action: BaseAction) => void;
}
export interface DiagramState {
    action: BaseAction | null;
    wasMoved: boolean;
    windowListener: any;
    diagramEngineListener: any;
    document: any;
}
export declare class DiagramWidget extends React.Component<DiagramProps & React.HTMLProps<HTMLDivElement>> {
    componentDidMount(): void;
    componentWillUnmount(): void;
    /**
     * Gets a model and element under the mouse cursor
     */
    getModelAtPosition(event: MouseEvent): {
        el: Element;
        model: BaseModel<any> | undefined;
    };
    fireAction(): void;
    stopFiringAction(shouldSkipEvent?: boolean): void;
    startFiringAction(a: BaseAction): void;
    onMouseDown(event: React.MouseEvent<HTMLDivElement>): void;
    onMouseMove(event: MouseEvent): void;
    onMouseUp(event: MouseEvent): void;
    onKeyUp(event: KeyboardEvent): void;
    onWheel(event: React.WheelEvent<HTMLDivElement>): void;
    render(): JSX.Element;
}
