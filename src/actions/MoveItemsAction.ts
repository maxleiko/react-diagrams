import { BaseAction } from './BaseAction';
import { PointModel } from '../models/PointModel';
import { NodeModel } from '../models/NodeModel';
import { APointModel } from '../models/abstract/APointModel';
import { ANodeModel } from '../models/abstract/ANodeModel';
import { DiagramEngine } from '../DiagramEngine';
import { BaseModel } from '../models/BaseModel';

export interface SelectionModel {
  model: PointModel | NodeModel;
  initialX: number;
  initialY: number;
}

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
      .filter(function ensureTyping(item: BaseModel): item is PointModel | NodeModel {
        return (item instanceof APointModel) || item instanceof ANodeModel;
      })
      .filter((item) => {
        if (item instanceof APointModel) {
          return !item.isConnectedToPort();
        }
        return true;
      })
      .map((model) => ({ model, initialX: model.x, initialY: model.y }));
    }
  }
}
