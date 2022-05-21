import { ShapeFlags, isString } from "@vue/shared";
import { createVNode, Text } from "./vnode";

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
        if (vnode == null) { // vnode 卸载

        } else {
            // 初始化或者更新
            patch(container._vnode || null, vnode, container);
        }
        container._vnode = vnode;
    }

    function patch(n1, n2, container) {
        if (n1 === n2) {
            return;
        }
        const {type} = n2;
        if (n1 == null) { // 初次渲染
            switch(type) {
                case Text:
                    processText(n1, n2, container);
                    break;
                default:
                    mountElement(n2, container);
            }
        } else { // 更新

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
        el._vnode = vnode; // vnode 和真实节点关联
        hostInsert(el, container);
    }

    function mountChildren(children, container) {
        for (let i = 0; i < children.length; i++) {
            const child = normalize(children[i]);
            patch(null, child, container);
        }
    }

    function processText(n1, n2, container) {
        if (n1 == null) {
            hostInsert(n2.el = hostCreateText(n2.children), container);
        }
    }

    function normalize(child) {
        if (isString(child)) {
            return createVNode(Text, null, child);
        }
        return child;
    }

    return {
        render
    };
}
