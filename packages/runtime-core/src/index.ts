import { ShapeFlags } from "@vue/shared";

export function createRenderer(renderOptions) {
    //core中不关心如何渲染
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
    const mountChildren = (children, container) => {
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            patch(null, child, container);
        }
    };
    const mountElement = (vnode, container) => {
        //创建真实节点
        // const el = vnode.el = hostCreateElement(vnode.type);  
        const {type,props,children,shapeFlags} = vnode;
        console.log(props,'mountElement');
        const el = vnode.el = hostCreateElement(type);
        //处理props
        if (props) {
            for (const key in props) {
                hostPatchProp(el, key, null, props[key]);
            }
        }
        if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, children);
        } else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {//递归
            mountChildren(children, el);
        }
        //将真实节点插入到容器中
        hostInsert(el, container);

    }
    //渲染走这里，更新也走这里
    const patch = (n1, n2, container) => {
        if (n1 === n2) {
            return;
        }
        if (n1 === null) {
            //挂载,初始化操作
            mountElement(n2, container); 
        }
    }
    //多次调用render时，会进行虚拟节点的比较，在进行更新
    const render = (vnode, container) => {
        // console.log(vnode, container, 'render');
        //将虚拟节点变成真实节点进行渲染
        //第一个参数是旧的节点，第二个参数是新的节点，第三个参数是容器
        patch(container._vnode ||null, vnode, container);
        container._vnode = vnode;
    };
    return {
        render,
    }
}