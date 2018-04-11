import * as _ from 'lodash';
import { PortModel } from '../../models/PortModel';
import { DiagramEngine } from '../../DiagramEngine';
import { DefaultLinkModel } from './DefaultLinkModel';
import { LinkModel } from '../../models/LinkModel';

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

  link(port: PortModel): LinkModel | null {
    const link = this.createLinkModel();
    if (link) {
      link.sourcePort = this;
      link.targetPort = port;
      return link;
    }
    return null;
  }

  canLinkToPort(port: PortModel): boolean {
    if (port instanceof DefaultPortModel) {
      if (this._in !== port._in) {
        const duplicate = Array.from(this.links.values())
          .find((link) => link.sourcePort === this && link.targetPort === port);
        return duplicate === undefined;
      }
      return false;
    }
    return true;
  }

  createLinkModel(): LinkModel | null {
    if (this.canCreateLink()) {
      return new DefaultLinkModel();
    }
    return null;
  }

  get in(): boolean {
    return this._in;
  }

  get label(): string {
    return this._label;
  }
}
