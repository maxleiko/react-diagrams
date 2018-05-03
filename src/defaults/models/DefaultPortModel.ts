import { observable, computed, action } from 'mobx';

import { PortModel } from '../../models/PortModel';
import { APortModel } from '../../models/abstract/APortModel';
import { DiagramEngine } from '../../DiagramEngine';
import { DefaultLinkModel } from './DefaultLinkModel';

export class DefaultPortModel extends APortModel {
  @observable private _in: boolean;
  @observable private _label: string;

  constructor(isInput: boolean, name: string, label: string | null = null) {
    super(name, 'srd-default-port');
    this._in = isInput;
    this._label = label || name;
  }

  @action
  fromJSON(object: any, engine: DiagramEngine) {
    super.fromJSON(object, engine);
    this._in = object.in;
    this._label = object.label;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      in: this._in,
      label: this._label
    };
  }

  @action
  link(port: DefaultPortModel): DefaultLinkModel {
    const link = new DefaultLinkModel();
    link.connect(this, port);
    return link;
  }

  canLinkToPort(port: PortModel): boolean {
    if (this.id !== port.id) {
      if (port instanceof DefaultPortModel) {
        if (this._in !== port._in) {
          const duplicate = this.links.find((link) => {
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

  @computed
  get in(): boolean {
    return this._in;
  }

  @computed
  get label(): string {
    return this._label;
  }
}
