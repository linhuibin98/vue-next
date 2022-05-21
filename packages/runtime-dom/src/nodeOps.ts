
export const nodeOps = {
    /**
     * 插入节点，anchor 为空，相当于 appendChild
     */
    insert(child, parent, anchor) {
        parent.insertBefore(child, anchor);
    },
    /**
     * 删除节点
     */
    remove(child) {
        const parent = child.parentNode;
        if (parent) {
            parent.removeChild(child);
        }
    },
    /**
     * 元素设置文本内容
     */
    setElementText(el, text) {
        el.textContent = text;
    },
    /**
     * 节点设置文本 document.createTextNode
     */
    setText(node, text) {
        node.nodeValue = text;
    },
    /**
     * 查询
     */
    querySelector(selector) {
        return document.querySelector(selector);
    },
    /**
     * 父节点
     */
    parentNode(node) {
        return node.parentNode;
    },
    /**
     * 兄弟节点
     */
    nextSibling(node) {
        return node.nextSibling;
    },
    /**
     * 创建元素
     */
    createElement(tag) {
        return document.createElement(tag);
    },
    /**
     * 创建文本
     */
    createText(text) {
        return document.createTextNode(text);
    }
}