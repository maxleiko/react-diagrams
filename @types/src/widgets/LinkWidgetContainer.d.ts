/// <reference types="react" />
import * as React from 'react';
import { LinkModel } from '../models/LinkModel';
export interface LinkProps {
    link: LinkModel;
}
export declare class LinkWidgetContainer extends React.Component<LinkProps> {
    render(): JSX.Element;
}
