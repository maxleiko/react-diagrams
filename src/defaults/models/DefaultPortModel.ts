import { observable, computed, action } from 'mobx';

import { PortModel } from '../../models/PortModel';
import { APortModel } from '../../models/abstract/APortModel';
import { DiagramEngine } from '../../DiagramEngine';
import { DefaultLinkModel } from './DefaultLinkModel';

export class DefaultPortModel extends APortModel {
  @observable private _in: boolean;

  constructor(isInput: boolean, name: string, maximumLinks: number = Infinity) {
    super(name, 'srd-default-port', maximumLinks);
    this._in = isInput;
  }

  @action
  fromJSON(object: any, engine: DiagramEngine) {
    super.fromJSON(object, engine);
    this._in = object.in;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      in: this._in,
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
}
