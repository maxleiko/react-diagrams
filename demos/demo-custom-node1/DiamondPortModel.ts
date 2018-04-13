import * as _ from 'lodash';
import {
  DiagramEngine,
  PortModel,
  DefaultLinkModel,
  DefaultPointFactory
} from 'storm-react-diagrams';

type Position = 'top' | 'bottom' | 'left' | 'right';

export class DiamondPortModel extends PortModel {
  position: Position;

  constructor(pos: Position = 'top') {
    super(pos, 'diamond');
    this.position = pos;
  }

  serialize() {
    return _.merge(super.serialize(), {
      position: this.position
    });
  }

  deSerialize(data: any, engine: DiagramEngine) {
    super.deSerialize(data, engine);
    this.position = data.position;
  }

  link(port: DiamondPortModel): DefaultLinkModel {
    const link = new DefaultLinkModel(new DefaultPointFactory());
    link.connect(this, port);
    return link;
  }
}
