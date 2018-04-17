import { BaseAction } from './BaseAction';
import { DiagramModel } from '../models/DiagramModel';
export declare class SelectingAction extends BaseAction {
    mouseX2: number;
    mouseY2: number;
    containsElement: (object: {
        x: number;
        y: number;
        model: DiagramModel;
    }) => boolean;
    constructor(mouseX: number, mouseY: number);
    readonly dimensions: {
        left: number;
        top: number;
        width: number;
        height: number;
        right: number;
        bottom: number;
    };
    readonly styles: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
}
