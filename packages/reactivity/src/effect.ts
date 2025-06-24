import { DirtyLevels } from "./constants";

export function effect(fn, options?) {
    //创建一个effect，只要依赖的属性变化了就要执行回调
    const _effect = new ReactiveEffect(fn, () => {
        //调度函数scheduler,一调用这个函数就会执行这个回调
        //数据变化后重新执行effect
        _effect.run();//重新执行effect

    });
    _effect.run();

    if (options) {
        Object.assign(_effect, options);//用户传递的覆盖掉内置的
    }
    //问问AI
    const runner = _effect.run.bind(_effect);//绑定this
    runner.effect = _effect;//将effect实例挂载到runner上
    return runner;

}
export let activeEffect;


function preCleanEffect(effect) {
    effect._depsLength = 0;
    effect._trackId++;//每次执行id+1，如果id变化了，说明依赖的属性发生了变化
}

function postCleanEffect(effect) {
    //[flag,age,xxx,xxx]  //depsLength = 4
    //[flag] -> effect.depsLength = 1
    //将多余的删除

    if (effect.deps.length > effect._depsLength) {
        for (let i = effect.depsLength; i < effect.deps.length; i++) {
            //将effect从dep中删除
            cleanDepEffect(effect.deps[i], effect);//删除映射表中对应的effect
        }
        effect.deps.length = effect._depsLength;//更新依赖列表的长度
    }
}
export class ReactiveEffect {
    _trackId = 0;//记录当前effect执行了几次
    deps = [];//记录当前effect依赖了哪些属性
    _depsLength = 0;
    _running = 0;
    _dirtyLevel = DirtyLevels.Dirty;//默认是脏的
    public active = true;


    //fn 就是用户传入的函数
    //scheduler 就是调度器
    //如果fn中以来的数据发生变化后，就需要重新调用 ->run()
    constructor(private fn, public scheduler) {

    }
    //当访问this.effect.dirty时，会执行get dirty()方法
    public get dirty() {
        return this._dirtyLevel === DirtyLevels.Dirty;
    }
    //当设置this.effect.dirty时，会执行set dirty(value)方法
    public set dirty(value) {
        this._dirtyLevel = value ? DirtyLevels.Dirty : DirtyLevels.NoDirty;
    }
    run() {
        this._dirtyLevel = DirtyLevels.NoDirty;//每次运行后此值就不脏了
        if (!this.active) {
            return this.fn();//执行用户传入的函数
            //如果是不激活的情况，只需要执行函数，不需要依赖收集
        }
        let lastEffect = activeEffect;
        try {
            activeEffect = this;//将当前的effect实例赋值给全局变量

            //effect重新执行前将上一次的依赖情况删除
            preCleanEffect(this);
            this._running++;
            return this.fn();//依赖收集
        } finally {
            this._running--;
            postCleanEffect(this);
            activeEffect = lastEffect;//执行完后将activeEffect重置为undefined 
        }

    }
    stop() {
        if (this.active) {
            this.active = false;//后续会实现，先把active设置为false 
            preCleanEffect(this);
            postCleanEffect(this);
        }

    }
}

function cleanDepEffect(dep, effect) {
    dep.delete(effect);
    if (dep.size === 0) {
        //如果dep中没有effect了，就将dep从effect中删除
        dep.cleanup();
    }
}

//双向记忆，收集器dep记录了effect，effect也记录了dep
export function trackEffects(effect, dep) {
    // console.log(dep.get(effect),effect._trackId)//第一次会返回undefined，dep.get(effect)是effect上一次收集依赖的_trackId
    //需要重新收集依赖
    if (dep.get(effect) !== effect._trackId) {//当在一个函数中多次访问同一个属性时，这两个就会不一样
        dep.set(effect, effect._trackId);//更新id，也是将effect放到dep映射表中
        //当执行了effect.run（）后，depsLength归零
        let oldDep = effect.deps[effect._depsLength];//把上一次的值取出来查看是否相同
        // console.log(oldDep,dep);
        if (oldDep !== dep) {
            if (oldDep) {
                //将旧的dep从effect中删除
                cleanDepEffect(oldDep, effect);
            }
            effect.deps[effect._depsLength++] = dep;//将dep放到effect.deps中
        } else {
            effect._depsLength++;
        }
    }
    // console.log(effect);

    // dep.set(effect,effect._trackId);
    // effect.deps[effect._depsLength++] = dep;
    // console.log(targetMap);
}
export function triggerEffects(dep) {
    //触发所有依赖于这个属性的函数重新执行
    for (const effect of dep.keys()) {
        console.log(effect);
        //当前这个值是不脏的，需要触发更新重新将值变为脏值
        if (effect._dirtyLevel < DirtyLevels.Dirty) {
            effect._dirtyLevel = DirtyLevels.Dirty;//4
        }


        if (!effect._running) {//避免陷入死循环
            if (effect.scheduler) {
                effect.scheduler();//如果有调度器，就调用调度器 
            }

        }
    }
}