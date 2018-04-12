import { BaseAction } from './BaseAction';
import { SelectionModel } from '../models/SelectionModel';
import { PointModel } from '../models/PointModel';
import { NodeModel } from '../models/NodeModel';
import { DiagramEngine } from '../DiagramEngine';
import { BaseEntity } from '../BaseEntity';
import { BaseModel } from '../models/BaseModel';

export class MoveItemsAction extends BaseAction {
  selectionModels: SelectionModel[];
  moved: boolean;

  constructor(mouseX: number, mouseY: number, engine: DiagramEngine) {
    super(mouseX, mouseY);
    this.moved = false;

    // if model is locked: do not allow moving
    if (engine.model.locked) {
      this.selectionModels = [];
    } else {
      this.selectionModels = engine.model.selectedEntities
      .filter((item) => !item.locked) // prevent locked item to move
      .filter(function ensureTyping(item: BaseModel<BaseEntity>): item is PointModel | NodeModel {
        return (item instanceof PointModel) || item instanceof NodeModel;
      })
      .map((model) => ({ model, initialX: model.x, initialY: model.y }));
    }
  }
}
