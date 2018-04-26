import { BaseModel } from './BaseModel';
import { PortModel } from './PortModel';
import { DiagramModel } from './DiagramModel';

export interface NodeModel<P extends PortModel = PortModel> extends BaseModel<DiagramModel> {
  readonly x: number;
  readonly y: number;

  ports: P[];
  portsMap: Map<string, P>;
  width: number;
  height: number;

  addPort(port: P): P;
  removePort(port: PortModel): void;
  setPosition(x: number, y: number): void;
  setSize(width: number, height: number): void;
}
