/// <reference types="react" />
import * as React from 'react';
import { DefaultLabelModel } from '../models/DefaultLabelModel';
export interface DefaultLabelWidgetProps {
    label: DefaultLabelModel;
}
export declare class DefaultLabelWidget extends React.Component<DefaultLabelWidgetProps> {
    render(): JSX.Element;
}
