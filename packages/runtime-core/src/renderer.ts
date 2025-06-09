import { ShapeFlags } from "@vue/shared";
import { isSameVnode } from "./createVnode";

export function createRenderer(renderOptions) {
    //core中不关心如何渲染
    //这是一组平台相关的DOM API，用于操作 DOM 元素
    const {
        insert: hostInsert,
        remove: hostRemove,
        createElement: hostCreateElement,
        createText: hostCreateText,
        setElementText: hostSetElementText,
        setText: hostSetText,
        parentNode: hostParentNode,
        nextSibling: hostNextSibling,
        patchProp: hostPatchProp,
    } = renderOptions;
    //递归挂载子节点
    const mountChildren = (children, container) => {
        for (let i = 0; i < children.length; i++) {
            // const child = children[i];
            //children[i]可能是纯文本元素
            patch(null, children[i], container);
        }
    };
    const mountElement = (vnode, container,anchor) => {
        //创建真实节点
        // const el = vnode.el = hostCreateElement(vnode.type);  
        const { type, props, children, ShapeFlag } = vnode;
        console.log(props, 'mountElement');
        const el = (vnode.el = hostCreateElement(type));
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
        hostInsert(el, container,anchor);

    }

    const processElement = (n1, n2, container,anchor) => {
        if (n1 == null) { //挂载,初始化操作
            mountElement(n2, container, anchor);
        } else { //更新操作 
            patchElement(n1, n2, container);
        }
    }

    const PatchProps = (oldProps, newProps, el) => {
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

    const patchKeyedChildren = (c1, c2, el) => { //比较两个子节点的差异
        let i = 0; //旧的开始
        let e1 = c1.length - 1; //旧的结束
        let e2 = c2.length - 1; //新的结束
        while (i <= e1 && i <= e2) { //从左往右比较
            const n1 = c1[i]; //旧的开始
            const n2 = c2[i]; //新的开始
            if (isSameVnode(n1, n2)) { //如果是同一个节点，那么就比较子节点
                patch(n1, n2, el); //递归比较子节点
            } else { //如果不是同一个节点，那么就将旧的节点卸载掉
                break; //跳出循环
            }
            i++; //旧的开始往后移
        }
        while (i <= e1 && i <= e2) { //从右往左比较
            const n1 = c1[e1]; 
            const n2 = c2[e2]; 
            if (isSameVnode(n1, n2)) { 
                patch(n1, n2, el); 
            } else { 
                break; 
            } 
            e1--; 
            e2--; 
        }

        if (i > e1) { //新的比旧的多，需要挂载新的
            if (i <= e2) { //新的比旧的多，需要挂载新的
                const nextPos = e2 + 1; //下一个位置
                const anchor = c2[nextPos]?.el; //下一个位置的元素
                while (i <= e2) { //从左往右比较
                    patch(null, c2[i], el, anchor); //递归比较子节点
                    i++; //旧的开始往后移
                }
            }
        } else if (i > e2) {
            if (i <= el) {
                while (i <= e1) { 
                    unmount(c1[i]); //将元素一个个删除
                    i++;
                }
            } 
        } else {
            let s1 = i;
            let s2 = i;
            //做一个映射表用于快速查找。看老的是否还在新的里面，没有就删除，有的就更新
            const keyToNewIndexMap = new Map();

            for (let i = s2;i <= e2;i++) {
                const vnode = c2[i];
                keyToNewIndexMap.set(vnode.key,i)
            }
            // console.log(i,e1,e2)

            //如果范围内旧节点中有新节点的key,则做更换
            for (let i = s1;i <=e1;i++){
                const vnode = c1[i];//旧节点
                const newIndex = keyToNewIndexMap.get(vnode.key)//通过key找到对应的索引

                if(newIndex == undefined){
                    //如果新的里面找不到则说明老的有的要删除掉
                    unmount(vnode);
                } else {
                    //比较前后节点差异，更新属性和儿子
                    patch(vnode,c2[newIndex],el);
                }
            }
            //调整顺序
            //可以按照新的队列，倒叙插入，通过参照物往前插入
            let toBePatched = e2 - s2 + 1;//要倒叙插入的个数
            for (let i = toBePatched; i >=0; i--) {
                let newIndex = s2 + i ;//对应的索引，找他的下一个元素作为参照物来进行插入
                let anchor = c2[newIndex+1]?.el
            }



            //插入的过程中，可能新的元素更多，需要创建
        }


    };

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
            //新的是文本，旧的是文本,内容不相同替换
            if (c1 !== c2) {
                hostSetElementText(el, c2); //直接替换文本
            }
        } else { //2.新的是数组，旧的是数组,全量diff算法
            if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                if (ShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    //全量diff算法，两个数组的比对
                    //比较两个子节点的差异
                    patchKeyedChildren(c1, c2, el);

                } else {//新的是文本，旧的是数组
                    unmountChildren(c1); //卸载旧的子节点
                }
            } else { //3.新的是数组，旧的是文本,直接替换文本
                if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                    hostSetElementText(el, ''); //直接替换文本
                }

                if (ShapeFlag & ShapeFlags.ARRAY_CHILDREN) { //新的是数组，旧的是文本,直接替换文本
                    mountChildren(c2, el); //挂载新的子节点
                }
            }
        }
    }

    const patchElement = (n1, n2, container) => {
        //1.比骄元素差异，肯定需要复用dom元素
        //2.比较属性和元素的子节点
        let el = (n2.el = n1.el); //复用旧的dom元素

        const oldProps = n1.props || {}; //旧的属性
        const newProps = n2.props || {}; //新的属性

        //hostPatchProp只针对一个属性来处理
        PatchProps(oldProps, newProps, el); //比较属性

        PatchChildren(n1, n2, el); //比较子节点
    }
    //渲染走这里，更新也走这里
    const patch = (n1, n2, container,anchor = null) => {
        if (n1 === n2) {
            return;
        }
        if (n1 && !isSameVnode(n1, n2)) { //判断是否是同一个节点，如果不是同一个节点，那么就将旧的节点卸载掉
            unmount(n1);
            n1 = null;
        }
        processElement(n1, n2, container,anchor);//处理元素
    }

    const unmount = (vnode) => {
        hostRemove(vnode.el);
    }

    //多次调用render时，会进行虚拟节点的比较，在进行更新
    const render = (vnode, container) => {
        if (vnode == null) {
            // console.log('vnode is null');
            unmount(container._vnode)
        }
        //将虚拟节点变成真实节点进行渲染
        //第一个参数是旧的节点，第二个参数是新的节点，第三个参数是容器
        patch(container._vnode || null, vnode, container);
        container._vnode = vnode;
    };
    return {
        render,
    }
}