import { activeEffect, trackEffects, triggerEffects } from "./effect";

const targetMap = new WeakMap();//WeakMap的key只能是对象,存放依赖收集的关系

//可以问问AI
export const createDep = (cleanup,key)=>{
    const dep = new Map() as any;//创建的收集器还是map
    dep.cleanup = cleanup;
    dep.name = key;//自定义则为了标识这个映射表是个哪个属性服务的
    return dep;//记住一定要返回啊
}

export function track(target,key) {
    //如果当前没有激活的effect，直接return
    if (activeEffect) {
        // console.log(activeEffect);
        
        let depsMap = targetMap.get(target);//取出depsMap
        if (!depsMap) {//如果没有depsMap，就创建一个新的Map
            targetMap.set(target,(depsMap = new Map()));//如果没有depsMap，就创建一个新的Map
        }
        //dep是state中的name等属性对应的effect集合
        let dep = depsMap.get(key);//取出dep·
        if (!dep) {//如果没有dep，就创建一个新的Set
            depsMap.set( 
                key,
                //当dep为空时，就将dep删除
                (dep = createDep(()=> depsMap.delete(key),key))//用于清理不需要的属性
            );
        }
        trackEffects(activeEffect,dep);//将当前的effect放到dep映射表中
        // console.log(targetMap,dep);
    };
} 

export function trigger(target,key,newValue,oldValue) {
    let depsMap = targetMap.get(target);
    // console.log(depsMap);
    if (!depsMap) {
        return;//如果没有depsMap，就直接return
    }
    let dep = depsMap.get(key);
    // console.log(dep);
    if (dep) {
        //执行dep中的effect
        triggerEffects(dep);
    }
}


    //执行dep中的effect
//差不多依赖收集是这个结构
//Map : { obj: {} }
//{
//    {name:'qiu',age:18}:{
//          age:{
//              effect
//          }
//          name:{
//              effect.effect2
//          }
//    }  
//}
