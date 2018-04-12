import { BaseModel } from './BaseModel';
import { BaseEntity } from '../BaseEntity';

export interface SelectionModel {
  model: BaseModel<BaseEntity>;
  initialX: number;
  initialY: number;
}
