import { BaseAction } from './BaseAction';
import { LinkModel } from '../models/LinkModel';
export declare class CreateLinkAction extends BaseAction {
    link: LinkModel;
    constructor(mouseX: number, mouseY: number, link: LinkModel);
}
