import { isObject } from "@vue/shared";
import { mutableHandlers, } from "./basehandler";
import { ReactiveFlags } from "./constants";

//用于记录我们的代理后的结果，可以复用
const reactiveMap = new WeakMap();//weakMap的key只能是对象



function createReactiveObject(target) {
    //统一做判断，响应式对象必须是对象才可以
    if (!isObject(target)) {
        return target; 
    }  
    //对象已经被代理过了，直接返回
    if (target[ReactiveFlags.IS_REACTIVE]) {
        return target; 
    }

    //取出缓存，如果有直接返回
    const exitsProxy = reactiveMap.get(target);
    if (exitsProxy) {
        return exitsProxy;
    }
    let proxy = new Proxy(target,mutableHandlers)
    //缓存代理结果，下次如果是同一个对象，直接返回代理结果
    reactiveMap.set(target,proxy)
    return proxy;
}
export function reactive(target) {
    return createReactiveObject(target);//创建一个响应式对象
}

export function toReactive(value){
    return isObject(value)? reactive(value):value;

}
export function isReactive(value){//判断是否是响应式对象
    return !!(value && value[ReactiveFlags.IS_REACTIVE]);//如果是响应式对象，就会有__v_isReactive属性
}