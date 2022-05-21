import { isArray } from '@vue/shared';
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
        if (isVNode(propsChildren)) {
            children = [propsChildren];
            propsChildren = null;
        } else if (isArray(propsChildren)) {
            children = propsChildren;
            propsChildren = null;
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
