import { BaseAction } from './BaseAction';
import { DiagramModel } from '../models/DiagramModel';
export declare class MoveCanvasAction extends BaseAction {
    initialOffsetX: number;
    initialOffsetY: number;
    constructor(mouseX: number, mouseY: number, model: DiagramModel);
}
