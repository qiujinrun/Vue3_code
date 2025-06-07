import { isObject, isString, ShapeFlags } from "@vue/shared";
import { createVnode, isVnode } from "./createVnode";
//构建一个虚拟节点
export function h(type, propsOrChildren?, children?) {
    let l = arguments.length; // 获取参数的长度
    if (l === 2) { // 如果参数长度为 2，说明只有 type 和 propsOrChildren 两个参数
        //h(h1,虚拟节点 | 属性)
        if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) { // 判断 propsOrChildren 是否是一个对象，并且不是一个数组
            //虚拟节点
            if (isVnode(propsOrChildren)) {
                //h('div',h('h1'))
                return createVnode(type, null, [propsOrChildren]); // 如果 propsOrChildren 是一个 vnode 节点，那么将其作为子节点创建一个新的 vnode 节点
            } else {
                //属性
                return createVnode(type, propsOrChildren); // 如果 propsOrChildren 是一个对象，那么将其作为属性创建一个新的 vnode 节点
            }
        }   
        //     是数组或者文本
        return createVnode(type, null, propsOrChildren);
        
    } else {
        if (l > 3) { // 如果参数长度为 3，说明有 type、propsOrChildren 和 children 三个参数
            children = Array.from(arguments).slice(2); // 将 arguments 转换为数组，并截取从索引 2 开始的所有元素，作为子节点
        } 
        if (l == 3 && isVnode(children)) {
            children = [children];
        }
        //文本直接走这里
        return createVnode(type, propsOrChildren, children);
    }
}
