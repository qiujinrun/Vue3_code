import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";
import { isRef } from "./ref";


export function watch(source, cb, options = {} as any) {

    //watchEffect 也是基于dowatch来实现的
    return doWatch(source, cb, options)
}

export function watchEffect(getter, options = {} as any) {
    //没有cb就是watchEffect
    return doWatch(getter, undefined, options as any)

}

//控制depth 以及档期那遍历到哪一层
//深度遍历每一层的属性，并且把每一层的属性都收集起来，然后返回这个对象
function traverse(source, depth, currentDepth = 0, seen = new Set()) {
    if (!isObject(source)) {
        return source;
    }
    if (depth) {
        if (currentDepth >= depth) {
            return source;
        }
        currentDepth++;
    }
    if (seen.has(source)) {
        return source;
    }
    for (let key in source) {
        traverse(source[key], depth, currentDepth, seen);
    }
    return source;
}
function doWatch(source, cb, { deep, immediate }) {
    const reactiveGetter = (source) =>
        traverse(source, deep === false ? 1 : undefined);

    let getter;
    if (isReactive(source)) {
        getter = () => reactiveGetter(source);
    } else if (isRef(source)) {
        getter = () => source.value;
    } else if (isFunction(source)) {
        getter = source;
    }

    //产生一个可以给ReactiveEffect来使用的getter，需要对这个对象来进行取值操作

    let oldValue;
    let clean;//函数
    const onCleanup = (fn) => {
        clean = () => {
            fn();
            clean = undefined;
        };
    };
    const obj = () => {
        if (cb) {
            if (clean) {
                clean();//在执行回调前，先调用上一次的清理操作
            }

            const newValue = effect.run();//获取新值
            cb(newValue, oldValue,onCleanup);//执行watch的回调函数
            oldValue = newValue;
        } else {
            effect.run();//直接执行
        }
    };
    const effect = new ReactiveEffect(getter, obj);
    if (cb) {
        if (immediate) {//立即先执行一次
            obj();
        } else {
            oldValue = effect.run();//获取旧值
        }
    } else {
        //watchEffect
        effect.run();//直接执行
    }

    const unwatch = () => {
        effect.stop();//停止effect
    };
    return unwatch;
}