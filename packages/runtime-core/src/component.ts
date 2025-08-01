import { proxyRefs, reactive } from "@vue/reactivity";
import { hasOwn, isFunction, ShapeFlags } from "@vue/shared";

export function createComponentInstance(vnode) {
    const instance = {
        data: null,  //状态
        vnode,  //组件的虚拟节点
        subTree: null,   //子树
        isMounted: false,//是否挂载完成
        update: null,//组件的更新的函数
        props: {},
        attrs: {},
        slots: {},
        propsOptions: vnode.type.props,  //用户声明的哪些属性是组件的属性
        component: null,
        proxy: null,//用来代理props,attrs,data让用户方便使用
        setupState: {},
    }
    return instance;
}

//初始化属性
const initProps = (instance, rawProps) => {
    const props = {};
    const attrs = {};
    const propsOptions = instance.propsOptions || {};

    if (rawProps) {
        for (let key in rawProps) {//用所有的来分裂
            const value = rawProps[key];
            if (key in propsOptions) {
                //propsOptions[key]  === value
                props[key] = value;//props不需要深度代理，组件不能更改属性
            } else {
                attrs[key] = value;
            }
        }
    }
    instance.attrs = attrs;
    instance.props = reactive(props);
}
const publicProperty = {
    $attrs: (instance) => instance.attrs,
    $slots: (instance) => instance.slots,
}

const handler = {
    get(target, key) {
        const { data, props, setupState } = target;
        if (data && hasOwn(data, key)) {
            return data[key];
        } else if (props && hasOwn(props, key)) {
            return props[key];
        } else if (setupState && hasOwn(setupState, key)) {
            return setupState[key];
        }

        const getter = publicProperty[key];  //通过不同的策略来访问对应的方法
        if (getter) {
            return getter(target);
        }
        //对于一些无法修改的属性，只能读取 $attrs
    },

    set(target, key, value) {
        const { data, props, setupState } = target;
        if (data && hasOwn(data, key)) {
            data[key] = value;
        } else if (props && hasOwn(props, key)) {
            // props[key] = value;
            console.warn("props are readonly")
            return false;
        } else if (setupState && hasOwn(setupState, key)) {
            setupState[key] = value;
        }
        return true;
    }
}

export function initSlots(instance, children) {
    if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
        instance.slots = children;
    } else {
        instance.slots = {};
    }
}

//初始化组件实例，并建立器响应式数据原理
export function setupComponent(instance) {
    const { vnode } = instance;
    //赋值属性
    initProps(instance, vnode.props);
    initSlots(instance, vnode.children)
    //赋值代理对象，最终会作为 data() 或 render() 中的 this 或上下文
    instance.proxy = new Proxy(instance, handler)

    const { data = () => { }, render, setup } = vnode.type

    if (setup) {
        const setupContext = {
            // ...
            slots: instance.slots,
            attrs: instance.attrs,
            emit(event,...payload) {
                //onMyEvent
                const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;

                const handler = instance.vnode.props[eventName];

                handler && handler(...payload);
            }
        };
        const setupResult = setup(instance.props, setupContext)

        if (isFunction(setupResult)) {
            instance.render = setupResult;
        } else {
            instance.setupState = proxyRefs(setupResult) //将返回的值做脱ref
        }
    }


    if (!isFunction(data)) {
        console.warn('data option must be a function');
    } else {
        //data 中可以拿到props
        instance.data = reactive(data.call(instance.proxy));
    }
    if (!instance.render) { //没有render用自己的render
        instance.render = render;
    }

} 