import { PointModel } from '../../models/PointModel';

export class DefaultPointModel extends PointModel {
  constructor(x: number, y: number) {
    super('srd-default-point', x, y);
  }
}
