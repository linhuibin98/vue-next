import { isArray, isString, ShapeFlags } from "@vue/shared";


export function createVNode(type, props, children = null) {
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;

    const vnode = {
        __v_isVNode: true,
        type,
        shapeFlag,
        key: props && props.key,
        el: null, // 虚拟节点对应的真实元素，diff 时会用到
        props,
        children
    };

    if (children) {
        let type = 0;
        if (isArray(children)) {
            type = ShapeFlags.ARRAY_CHILDREN; // 子标记节点是数组
        } else {
            children = String(children);
            type = ShapeFlags.TEXT_CHILDREN; // 标记子节点是文本
        }
        vnode.shapeFlag |= type;
    }

    return vnode;
}

export const Text = Symbol('Text'); // 文本类型

export function isVNode(value: unknown) {
    return !!(value && value['__v_isVNode']);
}

/**
 * 文本 vnode
 */
export function normalizeVNode(child) {
    if (isString(child)) {
        return createVNode(Text, null, child);
    }
    return child;
}

/**
 * 判断两个 vnode 是否相同
 * 1. 标签名相同
 * 2. key 一样
 */
export function isSameVNode(n1, n2) {
    return n1.key === n2.key && n1.type === n2.type;
}
