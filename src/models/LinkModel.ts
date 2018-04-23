import { BaseModel } from './BaseModel';
import { PortModel } from './PortModel';
import { PointModel } from './PointModel';
import { LabelModel } from './LabelModel';
import { DiagramModel } from './DiagramModel';

export interface LinkModel extends BaseModel<DiagramModel> {
  sourcePort: PortModel | null;
  targetPort: PortModel | null;
  firstPoint: PointModel;
  lastPoint: PointModel;
  points: PointModel[];
  labels: LabelModel[];

  getPointForPort(port: PortModel): PointModel | null;
  getPortForPoint(point: PointModel): PortModel | null;
  isLastPoint(point: PointModel): boolean;
  getPointModel(id: string): PointModel | undefined;
  getLabel(id: string): LabelModel | undefined;
  getPointIndex(point: PointModel): number;
  connect(source: PortModel, target: PortModel): void;
  addLabel(label: LabelModel): void;
  removePoint(point: PointModel): void;
  removeLabel(label: LabelModel): void;
  removePointsBefore(point: PointModel): void;
  removePointsAfter(point: PointModel): void;
  removeMiddlePoints(): void;
  addPoint(point: PointModel, index: number): PointModel;
}
