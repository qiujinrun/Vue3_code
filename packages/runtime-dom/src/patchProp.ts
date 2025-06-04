//主要是对节点元素的属性操作 class style event

import { patchAttr } from "./modules/patchAttr";
import { patchClass } from "./modules/patchClass";
import { patchEvent } from "./modules/patchEvent";
import { patchStyle } from "./modules/patchStyle";

export default function patchProp (el, key, prevValue, nextValue)  {
    if (key === "class") {
        return patchClass(el, nextValue);
    } else if (key === "style") {
        return patchStyle(el, prevValue, nextValue);
    } else if (/^on[^a-z]/.test(key)) { // 事件像onClick
        return patchEvent(el, key, nextValue);
    } else { // 普通属性
        return patchAttr(el, key, nextValue);
    }
}
//<div id="app" class="red" style="color: red" @click="handleClick"></div>