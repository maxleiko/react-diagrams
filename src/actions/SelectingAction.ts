import { BaseAction } from './BaseAction';
import { DiagramModel } from '../models/DiagramModel';

export class SelectingAction extends BaseAction {
  mouseX2: number;
  mouseY2: number;

  constructor(mouseX: number, mouseY: number) {
    super(mouseX, mouseY);
    this.mouseX2 = mouseX;
    this.mouseY2 = mouseY;
  }

  getBoxDimensions() {
    return {
      left: this.mouseX2 > this.mouseX ? this.mouseX : this.mouseX2,
      top: this.mouseY2 > this.mouseY ? this.mouseY : this.mouseY2,
      width: Math.abs(this.mouseX2 - this.mouseX),
      height: Math.abs(this.mouseY2 - this.mouseY),
      right: this.mouseX2 < this.mouseX ? this.mouseX : this.mouseX2,
      bottom: this.mouseY2 < this.mouseY ? this.mouseY : this.mouseY2
    };
  }

  containsElement(x: number, y: number, diagramModel: DiagramModel): boolean {
    const z = diagramModel.zoom / 100.0;
    const dimensions = this.getBoxDimensions();

    return (
      x * z + diagramModel.offsetX > dimensions.left &&
      x * z + diagramModel.offsetX < dimensions.right &&
      y * z + diagramModel.offsetY > dimensions.top &&
      y * z + diagramModel.offsetY < dimensions.bottom
    );
  }
}
