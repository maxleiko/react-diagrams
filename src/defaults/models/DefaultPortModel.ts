import * as _ from 'lodash';
import { PortModel } from '../../models/PortModel';
import { DiagramEngine } from '../../DiagramEngine';
import { DefaultLinkModel } from './DefaultLinkModel';
import { LinkModel } from '../../models/LinkModel';

export class DefaultPortModel extends PortModel {
  in: boolean;
  label: string;
  links: { [id: string]: DefaultLinkModel } = {};

  constructor(isInput: boolean, name: string, label: string | null = null, id?: string) {
    super(name, 'default', id);
    this.in = isInput;
    this.label = label || name;
  }

  deSerialize(object: any, engine: DiagramEngine) {
    super.deSerialize(object, engine);
    this.in = object.in;
    this.label = object.label;
  }

  serialize() {
    return _.merge(super.serialize(), {
      in: this.in,
      label: this.label
    });
  }

  link(port: PortModel): LinkModel {
    const link = this.createLinkModel();
    link.setSourcePort(this);
    link.setTargetPort(port);
    return link;
  }

  canLinkToPort(port: PortModel): boolean {
    if (port instanceof DefaultPortModel) {
      return this.in !== port.in;
    }
    return true;
  }

  createLinkModel(): LinkModel {
    const link = super.createLinkModel();
    return link || new DefaultLinkModel();
  }
}
