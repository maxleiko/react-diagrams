import { DefaultPortModel } from '@leiko/react-diagrams';
import { AdvancedLinkModel } from './AdvancedLinkModel';

export class AdvancedPortModel extends DefaultPortModel {
  createLinkModel(): AdvancedLinkModel | null {
    return new AdvancedLinkModel();
  }
}
