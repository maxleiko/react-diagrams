import { BaseAction } from './BaseAction';
import { SelectionModel } from '../models/SelectionModel';
import { PointModel } from '../models/PointModel';
import { NodeModel } from '../models/NodeModel';
import { DiagramEngine } from '../DiagramEngine';
import { BaseEntity } from '../BaseEntity';
import { BaseModel, BaseModelListener } from '../models/BaseModel';

export class MoveItemsAction extends BaseAction {
  selectionModels: SelectionModel[];
  moved: boolean;

  constructor(mouseX: number, mouseY: number, diagramEngine: DiagramEngine) {
    super(mouseX, mouseY);
    this.moved = false;
    let selectedItems = diagramEngine.model.getSelectedItems();

    // dont allow items which are locked to move
    selectedItems = selectedItems.filter((item) => {
      return !diagramEngine.model.locked && !item.locked;
    });

    this.selectionModels = selectedItems
      .filter(function ensureTyping(item: BaseModel<BaseEntity, BaseModelListener>): item is PointModel | NodeModel {
        return item instanceof PointModel || item instanceof NodeModel;
      })
      .map((model) => ({ model, initialX: model.x, initialY: model.y }));
  }
}
