import * as _ from 'lodash';
import {
  DiagramEngine,
  DefaultLinkModel,
  APortModel
} from '@leiko/react-diagrams';

type Position = 'top' | 'bottom' | 'left' | 'right';

export class DiamondPortModel extends APortModel {
  position: Position;

  constructor(pos: Position = 'top') {
    super(pos, 'diamond');
    this.position = pos;
  }

  toJSON() {
    return _.merge(super.toJSON(), {
      position: this.position
    });
  }

  fromJSON(data: any, engine: DiagramEngine) {
    super.fromJSON(data, engine);
    this.position = data.position;
  }

  link(port: DiamondPortModel): DefaultLinkModel {
    const link = new DefaultLinkModel();
    link.connect(this, port);
    return link;
  }
}
