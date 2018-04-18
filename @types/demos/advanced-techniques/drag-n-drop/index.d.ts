import './styles.scss';
declare const _default: () => JSX.Element;
export default _default;
export interface SidebarItemProps {
    name: string;
    type: 'in' | 'out';
    color: string;
}
export declare const SidebarItem: ({ name, color, type }: SidebarItemProps) => JSX.Element;
