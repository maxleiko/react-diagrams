/// <reference types="react" />
import * as React from 'react';
import { DefaultPointModel } from '../models/DefaultPointModel';
export interface DefaultPointWidgetProps {
    point: DefaultPointModel;
}
export declare class DefaultPointWidget extends React.Component<DefaultPointWidgetProps> {
    render(): JSX.Element;
}
