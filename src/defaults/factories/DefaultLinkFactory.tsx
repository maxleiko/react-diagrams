import * as React from 'react';
import * as cx from 'classnames';
import { DefaultLinkWidget } from '../widgets/DefaultLinkWidget';
import { DiagramEngine } from '../../DiagramEngine';
import { AbstractLinkFactory } from '../../factories/AbstractLinkFactory';
import { DefaultLinkModel } from '../models/DefaultLinkModel';
import { PointModel } from '../../models/PointModel';

/**
 * @author Dylan Vorster
 */
export class DefaultLinkFactory extends AbstractLinkFactory<DefaultLinkModel> {
  constructor(type: string = 'default') {
    super(type);
  }

  generateReactWidget(engine: DiagramEngine, link: DefaultLinkModel): JSX.Element {
    return <DefaultLinkWidget engine={engine} link={link} />;
  }

  generateSegment(engine: DiagramEngine, link: DefaultLinkModel, key: number, svgPath: string) {
    const addPoint = (event: React.MouseEvent<SVGPathElement>) => {
      if (!event.shiftKey) {
        const point = new PointModel(link, engine.getRelativeMousePoint(event));
        point.selected = true;
        link.addPoint(point);
      }
    };

    return (
      <g key={key} className="srd-segment">
        <path
          className="halo"
          strokeWidth={20}
          stroke={link.color}
          d={svgPath}
        />
        <path
          className="path"
          strokeWidth={link.width}
          stroke={link.color}
          onMouseDown={addPoint}
          d={svgPath}
        />
      </g>
    );
  }

  generatePoint(_engine: DiagramEngine, point: PointModel) {
    return (
      <g key={point.id} srd-id={point.id} className={cx('srd-point', { selected: point.selected })}>
        <circle cx={point.x} cy={point.y} r={5} className="point" />
        <circle className="halo" cx={point.x} cy={point.y} r={15} />
      </g>
    );
  }

  getNewInstance(_initialConfig?: any): DefaultLinkModel {
    return new DefaultLinkModel();
  }
}
