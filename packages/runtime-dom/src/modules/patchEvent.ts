function createInvoker(value) { // 事件处理函数的缓存，避免每次都重新创建函数，提升性能。
    const invoker = (e) => invoker.value(e);
    invoker.value = value; // 事件处理函数
    return invoker;
}
export function patchEvent(el, name, nextValue) {//btn,onClick,fn
    // 缓存事件
    const invokers = el._vei || (el._vei = {});
    const eventName = name.slice(2).toLowerCase();//提取事件名并转化为小写
    // 缓存的事件
    const existingInvoker = invokers[name];
    if (nextValue && existingInvoker) {
        // 如果有值，并且值等于新值
        return  (existingInvoker.value = nextValue);
    }
    if (nextValue) {
        // 没有值，创建事件
        const invoker = (invokers[name] = createInvoker(nextValue));//创建一个调用函数，并且内部保存了事件处理函数
        return el.addEventListener(eventName, invoker);
    } 
    if (existingInvoker) {
        // 没有值，并且有缓存的事件，删除事件
        el.removeEventListener(eventName, existingInvoker);
        invokers[name] = undefined;
    }
    //结果：
    // btn._vei = { onClick: invoker }，其中 invoker.value 是第一个处理函数。
    //DOM 上绑定了 click 事件，触发时调用 invoker，进而调用 invoker.value
}