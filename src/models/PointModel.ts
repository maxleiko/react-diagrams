import { BaseModel } from './BaseModel';
import { LinkModel } from './LinkModel';

export interface PointModel<P extends LinkModel = LinkModel> extends BaseModel<P> {
  x: number;
  y: number;

  isConnectedToPort(): boolean;
  setPosition(x: number, y: number): void;
}
