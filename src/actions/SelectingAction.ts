import { observable, computed } from 'mobx';
import { createTransformer } from 'mobx-utils';

import { BaseAction } from './BaseAction';
import { DiagramModel } from '../models/DiagramModel';

export class SelectingAction extends BaseAction {
  @observable mouseX2: number;
  @observable mouseY2: number;

  containsElement = createTransformer<{ x: number, y: number, model: DiagramModel }, boolean>(({ x, y, model }) => {
    const z = model.zoom / 100.0;

    return (
      x * z + model.offsetX > this.dimensions.left &&
      x * z + model.offsetX < this.dimensions.right &&
      y * z + model.offsetY > this.dimensions.top &&
      y * z + model.offsetY < this.dimensions.bottom
    );
  });

  constructor(mouseX: number, mouseY: number) {
    super(mouseX, mouseY);
    this.mouseX2 = mouseX;
    this.mouseY2 = mouseY;
  }

  @computed
  get dimensions() {
    return {
      left: this.mouseX2 > this.mouseX ? this.mouseX : this.mouseX2,
      top: this.mouseY2 > this.mouseY ? this.mouseY : this.mouseY2,
      width: Math.abs(this.mouseX2 - this.mouseX),
      height: Math.abs(this.mouseY2 - this.mouseY),
      right: this.mouseX2 < this.mouseX ? this.mouseX : this.mouseX2,
      bottom: this.mouseY2 < this.mouseY ? this.mouseY : this.mouseY2
    };
  }

  @computed
  get styles() {
    return {
      left: this.mouseX2 > this.mouseX ? this.mouseX : this.mouseX2,
      top: this.mouseY2 > this.mouseY ? this.mouseY : this.mouseY2,
      width: Math.abs(this.mouseX2 - this.mouseX),
      height: Math.abs(this.mouseY2 - this.mouseY)
    };
  }
}
