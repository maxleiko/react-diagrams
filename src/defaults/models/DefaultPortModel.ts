import * as _ from 'lodash';
import { PortModel } from '../../models/PortModel';
import { DiagramEngine } from '../../DiagramEngine';

export class DefaultPortModel extends PortModel {
  private _in: boolean;
  private _label: string;

  constructor(isInput: boolean, name: string, label: string | null = null) {
    super(name, 'srd-default-port', -1);
    this._in = isInput;
    this._label = label || name;
  }

  deSerialize(object: any, engine: DiagramEngine) {
    super.deSerialize(object, engine);
    this._in = object.in;
    this._label = object.label;
  }

  serialize() {
    return _.merge(super.serialize(), {
      in: this._in,
      label: this._label
    });
  }

  canLinkToPort(port: PortModel): boolean {
    if (this.id !== port.id) {
      if (port instanceof DefaultPortModel) {
        if (this._in !== port._in) {
          const duplicate = Array.from(this.links.values()).find((link) => {
            if (link.sourcePort && link.sourcePort.id === port.id) {
              return true;
            }
            if (link.targetPort && link.targetPort.id === port.id) {
              return true;
            }
            return false;
          });
          return duplicate === undefined;
        }
        return false;
      }
    }
    return false;
  }

  get in(): boolean {
    return this._in;
  }

  get label(): string {
    return this._label;
  }
}
