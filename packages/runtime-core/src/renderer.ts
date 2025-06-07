import { ShapeFlags } from "@vue/shared";
import { isSameVnode } from "./createVnode";

export function createRenderer(renderOptions) {
    //core中不关心如何渲染
    //这是一组平台相关的DOM API，用于操作 DOM 元素
    const {
        insert:hostInsert,
        remove:hostRemove,
        createElement:hostCreateElement,
        createText:hostCreateText,
        setElementText:hostSetElementText,
        setText:hostSetText,
        parentNode:hostParentNode,
        nextSibling:hostNextSibling,
        patchProp:hostPatchProp,
    } = renderOptions;
    //递归挂载子节点
    const mountChildren = (children, container) => {
        for (let i = 0; i < children.length; i++) {
            // const child = children[i];
            //children[i]可能是纯文本元素
            patch(null, children[i], container);
        }
    };
    const mountElement = (vnode, container) => {
        //创建真实节点
        // const el = vnode.el = hostCreateElement(vnode.type);  
        const {type,props,children,ShapeFlag} = vnode;
        console.log(props,'mountElement');
        const el  = (vnode.el = hostCreateElement(type));
        //处理props
        if (props) {
            for (const key in props) {
                hostPatchProp(el, key, null, props[key]);
            }
        }
        if (ShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, children);
        } else if (ShapeFlag & ShapeFlags.ARRAY_CHILDREN) {//递归
            mountChildren(children, el);
        }
        //将真实节点插入到容器中
        hostInsert(el, container);

    }

    const processElement = (n1, n2, container) => {
        if (n1 == null) { //挂载,初始化操作
            mountElement(n2, container);
        } else { //更新操作 
            patchElement(n1, n2,container);
        }
    }

    const PatchProps = (oldProps, newProps,el) => {
        //新的全部生效
        for (let key in newProps) {
            hostPatchProp(el, key, oldProps[key], newProps[key]); 
        }
        for (let key in oldProps) { //新的没有的，需要删除
            if (!(key in newProps)) {
                hostPatchProp(el, key, oldProps[key], null);
            }
        }
    }
    const unmountChildren = (children) => { //卸载子节点
        for (let i = 0; i < children.length; i++) {
            unmount(children[i]);
        }
    }
    const PatchChildren = (n1, n2, el) => {
        const c1 = n1.children; //旧的子节点
        const c2 = n2.children; //新的子节点
        const preShapeFlag = n1.ShapeFlag; //旧的子节点的类型
        const ShapeFlag = n2.ShapeFlag; //新的子节点的类型

        //1.新的是文本，旧的是数组,卸载旧的子节点
        if (ShapeFlag & ShapeFlags.TEXT_CHILDREN) { 
            if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) { 
                //卸载旧的子节点
                unmountChildren(c1);
            }
        }
    }

    const patchElement = (n1, n2,container) => {
        //1.比骄元素差异，肯定需要复用dom元素
        //2.比较属性和元素的子节点
        let el = (n2.el = n1.el); //复用旧的dom元素

        const oldProps = n1.props || {}; //旧的属性
        const newProps = n2.props || {}; //新的属性

        //hostPatchProp只针对一个属性来处理
        PatchProps(oldProps, newProps,el); //比较属性

        PatchChildren(n1, n2, el); //比较子节点
    }
    //渲染走这里，更新也走这里
    const patch = (n1, n2, container) => {
        if (n1 === n2) {
            return;
        }
        if (n1 && !isSameVnode(n1, n2)) { //判断是否是同一个节点，如果不是同一个节点，那么就将旧的节点卸载掉
            unmount(n1);
            n1 = null;
        }
        processElement(n1, n2, container);//处理元素
    }

    const unmount = (vnode) => {
        hostRemove(vnode.el);
    }

    //多次调用render时，会进行虚拟节点的比较，在进行更新
    const render = (vnode, container) => {
        if (vnode == null) { 
            console.log('vnode is null');
            unmount(container._vnode )
        }
        //将虚拟节点变成真实节点进行渲染
        //第一个参数是旧的节点，第二个参数是新的节点，第三个参数是容器
        patch(container._vnode ||null, vnode, container);
        container._vnode = vnode;
    };
    return {
        render,
    }
}