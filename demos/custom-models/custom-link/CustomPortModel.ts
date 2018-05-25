import { DefaultPortModel, PortModel, DefaultLinkModel } from '@leiko/react-diagrams';
import { action } from 'mobx';

export class CustomPortModel extends DefaultPortModel {

  @action
  link(port: PortModel): DefaultLinkModel {
    const link = new DefaultLinkModel('rgba(200, 20, 20, 0.5)', 7, 100);
    link.connect(this, port);
    return link;
  }
}
