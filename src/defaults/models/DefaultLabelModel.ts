import { LabelModel } from '../../models/LabelModel';

export class DefaultLabelModel extends LabelModel {
  private _label: string | null = null;

  constructor() {
    super('srd-default-label');
    this.offsetY = -23;
  }

  get label(): string | null {
    return this._label;
  }

  set label(label: string | null) {
    this._label = label;
  }
}
