import { isFunction } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { trackRefValue, triggerRefValue } from "./ref";
//this = aliasName(computed)
class ComputedRefImpl {
    public _value;
    public effect;
    public dep;
    constructor(getter, public setter) {//getter和setter是用户传入的函数
        //需要创建一个effect来关联当前计算属性的dirty属性
        this.effect = new ReactiveEffect(
            () => getter(this._value),//用户传入的函数
            () => {//调度函数
                //计算属性依赖的值变化了，我们应该触发effect重新执行
                triggerRefValue(this);
                console.log(this.dep);
                // this.effect.dirty = true;
            })
    }
    //在访问aliasName.value时，会执行get value()方法
    get value() {
        if (this.effect.dirty) {//默认取值一定是脏的，但是执行一次run后就不脏了
            this._value = this.effect.run();
            //如果在当前effect中访问了计算属性，计算属性是可以收集effect的
            trackRefValue(this);
            // console.log(this);
        }
        return this._value;
    }
    //在修改aliasName.value时，会执行set value(newValue)方法
    set value(newValue) {
        //这就是ref的setter
        this.setter(newValue);
    }
}

export function computed(getterOrOptions) {
    let onlyGetter = isFunction(getterOrOptions);

    let getter;
    let setter;
    if (onlyGetter) {
        getter = getterOrOptions;
        setter = () => { };
    } else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    // console.log(getter,setter);
    const react = new ComputedRefImpl(getter, setter);
    return react;
}   