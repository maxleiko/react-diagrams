export abstract class BaseAction {
  start: number = Date.now();
  end: number = -1;
  mouseX: number;
  mouseY: number;

  constructor(mouseX: number, mouseY: number) {
    this.mouseX = mouseX;
    this.mouseY = mouseY;
  }
}
