import {nodeOps} from "./nodeOps";
import patchProp from "./patchProp";

import {} from "@vue/runtime-core";
//将节点操作和属性操作合并在一起
const renderOptions = Object.assign(nodeOps, { patchProp });
export  {renderOptions};
// export * from "@vue/reactivity";
// function createRenderer(){}

export * from "@vue/runtime-core";
//runtime-dom 引用了 runtime-core , runtime-core 引用了reactivity