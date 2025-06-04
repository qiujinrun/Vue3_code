//主要是对节点元素的增删改查
export const nodeOps = {
    //移除元素
    remove (child){
        const parentNode = child.parentNode;
        if (parentNode) {
            parentNode.removeChild(child);
        }
    },

    //设置元素的文本内容
    setText : (node, text) => { node.textContent = text; },
    createText : (text) => document.createTextNode(text),
    parentNode : (node) => node.parentNode,
        //创建元素
    createElement :(type) =>  document.createElement(type) ,
    //设置元素的文本内容
    setElementText: (el, text) => { el.textContent = text; },
    //插入元素,如果第三个元素不存在 === appendChild
    insert: (child, parent, anchor) => { parent.insertBefore(child, anchor || null); },
    nextSibling: (node) => node.nextSibling,
}