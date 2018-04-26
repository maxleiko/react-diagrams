import { LinkModel } from './LinkModel';
import { NodeModel } from './NodeModel';
import { BaseModel } from './BaseModel';
// import { PortModel } from './PortModel';

export interface DiagramModel extends BaseModel {
  links: LinkModel[];
  linksMap: Map<string, LinkModel>;
  nodes: NodeModel[];
  nodesMap: Map<string, NodeModel>;
  offsetX: number;
  offsetY: number;
  zoom: number;
  gridSize: number;
  allowLooseLinks: boolean;
  allowCanvasTranslation: boolean;
  allowCanvasZoom: boolean;
  inverseZoom: boolean;
  smartRouting: boolean;
  deleteKeys: number[];
  maxNumberPointsPerLink: number;

  clearSelection(ignore?: BaseModel<any>): void;
  addAll(...models: BaseModel[]): BaseModel[];
  addLink(link: LinkModel): LinkModel;
  addNode(node: NodeModel): NodeModel;
  removeLink(link: LinkModel | string): void;
  removeNode(node: NodeModel | string): void;
}
