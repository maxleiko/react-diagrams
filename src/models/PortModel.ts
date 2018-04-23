import { BaseModel } from './BaseModel';
import { NodeModel } from './NodeModel';
import { LinkModel } from './LinkModel';

export interface PortModel extends BaseModel<NodeModel> {
  maximumLinks: number;
  links: LinkModel[];
  linksMap: Map<string, LinkModel>;
  x: number;
  y: number;
  width: number;
  height: number;
  connected: boolean;

  getLink(id: string): LinkModel | undefined;
  addLink(link: LinkModel): void;
  canCreateLink(): boolean;
  removeLink(link: LinkModel): void;
  setPosition(x: number, y: number): void;
  canLinkToPort(_port: PortModel): boolean;
}
