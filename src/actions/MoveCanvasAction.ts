import { BaseAction } from './BaseAction';
import { DiagramModel } from '../models/DiagramModel';

export class MoveCanvasAction extends BaseAction {
  initialOffsetX: number;
  initialOffsetY: number;

  constructor(mouseX: number, mouseY: number, model: DiagramModel) {
    super(mouseX, mouseY);
    this.initialOffsetX = model.offsetX;
    this.initialOffsetY = model.offsetY;
  }
}
