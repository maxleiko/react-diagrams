import { DiagramEngine } from '../DiagramEngine';

export interface BaseModel<P extends BaseModel = any> {
  id: string;
  type: string;
  locked: boolean;
  selected: boolean;
  parent: P | null;
  selectedEntities: BaseModel[];

  delete(): void;
  fromJSON(data: any, engine: DiagramEngine): void;
  toJSON(): any;
}
