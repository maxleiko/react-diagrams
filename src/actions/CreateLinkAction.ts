import { BaseAction } from './BaseAction';
import { LinkModel } from '../models/LinkModel';

export class CreateLinkAction extends BaseAction {

  constructor(mouseX: number, mouseY: number, public link: LinkModel) {
    super(mouseX, mouseY);
  }
}