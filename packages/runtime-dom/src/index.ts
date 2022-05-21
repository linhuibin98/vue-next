import { nodeOps } from './nodeOps';
import { patchProp } from './patchProp';

const renderOptions = Object.assign(nodeOps, {patchProp});

function createRenderer(renderOptions) {

    function render(vnode, container) {

    }

    return {
        render
    };
}

export function render(vnode, container) {

    return createRenderer(renderOptions).render(vnode, container);
}
