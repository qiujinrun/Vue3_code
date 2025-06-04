export function patchStyle(el, prevValue, nextValue) {
    const style = el.style;
    for (let key in nextValue) {
        style[key] = nextValue[key];//新的样式要全部生效
    }
    if (prevValue) {
        for (const key in prevValue) {
            //如果新的样式中没有旧的样式，那么就将旧的样式移除
            if (nextValue[key] == null) {
                style[key] = "";
            }
        }
    }
}