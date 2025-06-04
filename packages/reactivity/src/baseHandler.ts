import { isObject } from "@vue/shared";
import { activeEffect } from "./effect";
import { reactive } from "./reactive";
import { track, trigger } from "./reactiveEffect";
import { ReactiveFlags } from "./constants";


//proxy需要搭配reflect使用
export const mutableHandlers:ProxyHandler<any> = {
    //其中recevier是下面的proxy
    get(target,key,recevier) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true;
        }
        track(target,key);
        //当取值的时候 应该让响应式属性和 effect 映射起来

        let res = Reflect.get(target,key,recevier);
        if (isObject(res)) {//如果是对象，就递归代理
            return reactive(res); 
        }
        activeEffect ;
        return Reflect.get(target,key,recevier);
        //这是有问题的,如果tatget里面的key是一个属性访问器，那么this就会出问题
        // return target[key];

    },
    set(target,key,value,recevier) {
        //找到属性 让对应的effect重新执行

        let oldValue = target[key];
        let result = Reflect.set(target,key,value,recevier);
        if (oldValue !== value) {
            trigger(target,key,value,oldValue);
        }
        return result;
    }
}