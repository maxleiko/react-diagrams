import { BaseModel } from '../models/BaseModel';
import { DiagramEngine } from '../DiagramEngine';

export abstract class AbstractFactory<T extends BaseModel> {
  private _type: string;

  constructor(type: string) {
    this._type = type;
  }

  get type(): string {
    return this._type;
  }

  abstract getNewInstance(initialConfig?: any): T;
  abstract generateReactWidget(diagramEngine: DiagramEngine, model: T): JSX.Element;
}
