import { APointModel } from '../../models/abstract/APointModel';

export class DefaultPointModel extends APointModel {
  constructor(x: number, y: number) {
    super('srd-default-point', x, y);
  }
}
