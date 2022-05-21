import { isArray, isObject } from '@vue/shared';
import { createVNode, isVNode } from "./vnode";

/**
 *@example
 ```ts
h('div', {}, 'hello')
h('div', null, 'hello')
h('div', {}, h('span', null, 'hello'))
h('div', [h('span', null, 'hello')])
h('div', h('span', null, 'hello'))
 ```
 */
export function h(type, propsChildren, children) {
    const l = arguments.length;
    if (l === 2) {
        if (isObject(propsChildren) && !isArray(propsChildren)) {
            // propsChildren 为对象，则没有 children
            return createVNode(type, propsChildren);
        } else { // propsChildren 为 array 或者 string
            return createVNode(type, null, propsChildren)
        }
    } else if (l === 3) {
        if (!isArray(children)) {
            children = [children];
        }
    } else if (l > 3) {
        children = Array.from(arguments).slice(2);
    }

    return createVNode(type, propsChildren, children);
}
