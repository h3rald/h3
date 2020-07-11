declare type PropertyValue = string | number | boolean | Function | Record<string, any> | Array<PropertyValue>;
declare type PropertyObject = Record<string, PropertyValue>;
declare class FlexibleElement extends HTMLElement {
    [key: string]: PropertyValue;
    value?: string;
}
declare class NodeVNodePair {
    node: FlexibleElement;
    vnode: VNode;
}
declare type OnRenderCallback = (node?: FlexibleElement | Text) => void;
declare type EventHandler = (e?: Event) => void;
declare type ComponentFunction = (...params: Array<PropertyValue>) => VNode;
interface VTextNode {
    type: string;
    value: string;
}
declare type VNodeLike = string | VNode | ComponentFunction | VTextNode;
export declare class VNode {
    type: string;
    props: PropertyObject;
    data: PropertyObject;
    id: string;
    $html: string;
    $onrender: OnRenderCallback;
    style: string;
    element?: FlexibleElement;
    value: string;
    children: Array<VNode>;
    classList: Array<string>;
    eventListeners: Record<string, EventHandler>;
    constructor(el: VNodeLike, props?: PropertyObject, ...children: Array<VNodeLike>);
    from(data: VNode): void;
    equal(a: PropertyValue, b?: PropertyValue): boolean;
    processProperties(props: PropertyObject): void;
    processSelector(selector: string): void;
    processComponent(arg: ComponentFunction): VNode;
    processChild(arg: VNodeLike): VNode;
    processChildren(arg: Array<VNodeLike>): void;
    render(): FlexibleElement | Text;
    redraw(data: NodeVNodePair): void;
}
export declare const h: (el: VNodeLike, props?: PropertyObject, ...children: Array<VNodeLike>) => VNode;
export declare const update: (oldvnode: HTMLElement | VNode, newvnode?: VNode) => VNode;
export {};
//# sourceMappingURL=vdom.d.ts.map