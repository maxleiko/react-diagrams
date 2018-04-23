import { BaseModel } from './BaseModel';
import { PortModel } from './PortModel';
import { DiagramModel } from './DiagramModel';

export interface NodeModel<P extends PortModel = PortModel> extends BaseModel<DiagramModel> {
  ports: P[];
  portsMap: Map<string, P>;
  x: number;
  y: number;
  width: number;
  height: number;

  getPort(id: string): P | undefined;
  addPort(port: P): P;
  removePort(port: PortModel): void;
  setPosition(x: number, y: number): void;
  setSize(width: number, height: number): void;
}
