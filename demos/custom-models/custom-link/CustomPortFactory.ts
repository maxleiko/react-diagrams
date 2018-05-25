import { DefaultPortFactory } from '@leiko/react-diagrams';
import { CustomLinkFactory } from './CustomLinkFactory';

export class CustomPortFactory extends DefaultPortFactory {
  getLinkFactory() {
    return new CustomLinkFactory();
  }
}
