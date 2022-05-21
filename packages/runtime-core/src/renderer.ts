import { ShapeFlags } from "@vue/shared";
import { Text, normalizeVNode, isSameVNode } from "./vnode";

export function createRenderer(renderOptions) {
    const {
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    querySelector: hostQuerySelector,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp,
    } = renderOptions;

    function render(vnode, container) {
        if (vnode == null) {
            // vnode 卸载
            if (container._vnode) {
                unmount(container._vnode);
            }
        } else {
            // 初始化或者更新
            patch(container._vnode || null, vnode, container);
        }
        container._vnode = vnode; // vnode 和真实节点关联
    }

    function patch(n1, n2, container) {
        if (n1 === n2) {
            return;
        }
        // 更新 1. 如果前后完全没有关系， 删除老的，添加新的
        if (n1 && !isSameVNode(n1, n2)) {
            unmount(n1);
            n1 = null;
        }
        const {type, shapeFlag} = n2;
        switch(type) {
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container);
                }
        }
    }

    function processText(n1, n2, container) {
        if (n1 == null) {  // 初始化 createTextNode
            hostInsert(n2.el = hostCreateText(n2.children), container);
        } else { // 文本更新
            // 复用老的文本节点
            const el = n2.el = n1.el;
            if (n1.children !== n2.children) {
                hostSetText(el, n2.children);
            }
        }
    }

    function processElement(n1, n2, container) {
        if (n1 == null) { // 元素初次渲染
            mountElement(n2, container);
        } else { // 元素更新
            patchElement(n1, n2, container);
        }
    }

    function mountElement(vnode, container) {
        const {type, props, children, shapeFlag} = vnode;
        const el = vnode.el = hostCreateElement(type); // 将真实节点挂载到 vnode 上
        if (props) {
            for (let key in props) {
                hostPatchProp(el, key, null, props[key]);
            }
        }
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) { // 子节点是文本
            hostSetElementText(el, children);
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 子节点是数组
            mountChildren(children, el);
        }
        hostInsert(el, container);
    }

    function mountChildren(children, container) {
        for (let i = 0; i < children.length; i++) {
            const child = normalizeVNode(children[i]);
            render(child, container);
        }
    }

    function patchElement(n1, n2, container) {
        /**
         * 更新
         * 1. 如果前后完全没有关系， 删除老的，添加新的
         * 2. 老的和新的一样，复用。属性可能不一样，diff props
         * 3. 对比 children
         */
    }

    function unmount(vnode) {
        hostRemove(vnode.el);
    }

    return {
        render
    };
}
