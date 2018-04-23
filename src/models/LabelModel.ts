import { BaseModel } from './BaseModel';
import { LinkModel } from './LinkModel';

export interface LabelModel extends BaseModel<LinkModel> {
  offsetX: number;
  offsetY: number;
}
