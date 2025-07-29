import { isObject, isString, ShapeFlags } from "@vue/shared";

export const Text = Symbol("Text")
export const Fragment = Symbol("Fragment");
export function isVnode(value) { // 判断是否是一个 vnode 节点
    return value.__v_isVnode; // 判断是否有 __v_isVnode 属性
}
export function isSameVnode(n1, n2) { // 判断两个 vnode 节点是否是同一个节点
    return n1.type === n2.type && n1.key === n2.key; // 判断类型和 key 是否相同
}
export function createVnode(type, props, children?) {
    const shapeFlag = isString(type) 
    ? ShapeFlags.ELEMENT 
    : isObject(type) 
    ? ShapeFlags.STATEFUL_COMPONENT 
    : 0; // 判断节点类型，是元素节点还是文本节点
    const vnode = {
        __v_isVnode: true, // 标识是一个 vnode 节点
        type, // 节点类型，比如 div、span、p 等
        props, // 节点的属性，比如 id、class、style 等
        children, // 子节点，可以是一个字符串、数组、vnode 等
        key: props?.key, // 节点的 key，用于 diff 算法
        el: null, // 虚拟节点对应的真实 DOM 元素
        shapeFlag

    };
    // 判断子节点的类型
    if (children) {
        if (Array.isArray(children)) { // 子节点是数组，说明是多个子节点
            vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN; // 标识是一个数组子节点 
        } else if (isObject(children)) {
            vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
        } 
        else { // 子节点是字符串，说明是一个文本节点
            children = String(children); // 转换为字符串
            vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN; // 标识是一个文本子节点
        }
    }
    return vnode;

}