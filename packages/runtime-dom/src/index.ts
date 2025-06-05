import {nodeOps} from "./nodeOps";
import patchProp from "./patchProp";

import {createRenderer} from "@vue/runtime-core";
//将节点操作和属性操作合并在一起
const renderOptions = Object.assign({ patchProp },nodeOps);
export  {renderOptions};

//renderer 方法采用domapi来进行渲染
export const render = (vnode,container) => {
    return createRenderer(renderOptions).render(vnode,container);
}

export * from "@vue/runtime-core";
//runtime-dom 引用了 runtime-core , runtime-core 引用了reactivity