import { BaseAction } from './BaseAction';
import { SelectionModel } from '../models/SelectionModel';
import { DiagramEngine } from '../DiagramEngine';
export declare class MoveItemsAction extends BaseAction {
    selectionModels: SelectionModel[];
    moved: boolean;
    constructor(mouseX: number, mouseY: number, engine: DiagramEngine);
}
