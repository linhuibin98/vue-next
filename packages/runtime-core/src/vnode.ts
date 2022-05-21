import { isArray, isString, ShapeFlags } from "@vue/shared";


export function createVNode(type, props, children = null) {
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;

    const vnode = {
        __v_isVNode: true,
        type,
        shapeFlag,
        key: props && props.key,
        el: null, // 虚拟节点对应的真实元素
        props,
        children
    };

    if (children) {
        let type = 0;
        if (isArray(children)) {
            type = ShapeFlags.ARRAY_CHILDREN;
        }  else {
            children = String(children);
            type = ShapeFlags.TEXT_CHILDREN;
        }
        vnode.shapeFlag |= type;
    }

    return vnode;
}

export function isVNode(value: unknown) {
    return !!(value && value['__v_isVNode']);
}
