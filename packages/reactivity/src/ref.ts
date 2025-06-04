import { activeEffect, trackEffects, triggerEffects } from "./effect";
import { toReactive } from "./reactive";
import { createDep } from "./reactiveEffect";

//reactive shollowReactive
export function ref(value) {
    return createRef(value);
}

function createRef(value) {
    return new RefImpl(value)
}

class RefImpl {
    public __v_isRef = true;//增加ref标识
    public _value;//用来保存ref的值
    public dep;//用于收集对应的effect
    constructor(public rawValue) { 
        //如果是对象，需要将对象变成响应式的
        this._value = toReactive(rawValue);
    }
    //当访问this.ref.value时，会执行get value()方法
    get value() {
        trackRefValue(this);
        return this.rawValue;

    }
    set value(newValue) {
        if (newValue !== this.rawValue) {
            this.rawValue = newValue;//更新值
            this._value = newValue;
            triggerRefValue(this);
        }
    }
}

export function trackRefValue(ref) {
    if (activeEffect) {
        trackEffects(
            activeEffect,
            (ref.dep = ref.dep || createDep(() => (ref.dep = undefined),"undefined" ))
        );
    }
}

export function triggerRefValue(ref) {
    // console.log(ref.dep);
    let dep = ref.dep
    if (dep) {
        triggerEffects(dep);//触发依赖更新
    }
} 

//toRefs，toRef

class ObjectRefImpl {
    public __v_isRef = true;//增加ref标识
    constructor(public _object,public _key) { }
    get value() {
        return this._object[this._key];//属性访问器
    }
    set value(newValue) {
        this._object[this._key] = newValue;
    }
}
export function toRef(object,key) {
    return new ObjectRefImpl(object,key)
}

export function toRefs(object) {
    const res = {};
    for (let key in object) {//把对象中所有的属性都变成ref
        res[key] = toRef(object,key);
    }
    return res;
}

export function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs,{
        get(target,key,receiver) {
            let r = Reflect.get(target,key,receiver);
            return r.__v_isRef ? r.value : r;//自动脱ref
        },
        set(target,key,value,receiver) {
            const oldValue = target[key];
            if (oldValue !== value) {
                if (oldValue.__v_isRef) {
                    oldValue.value = value;//如果老值是ref，就更新老值的value
                    return true;
                } else {
                    return Reflect.set(target,key,value,receiver);
                }
            }
        }
    })    
}
export function isRef(value) { //判断是否是ref对象
    return value && value.__v_isRef;
}