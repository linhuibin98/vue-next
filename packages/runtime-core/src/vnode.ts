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
