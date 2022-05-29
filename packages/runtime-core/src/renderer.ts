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
        container._vnode = vnode; // 最新 vnode 和真实节点关联
    }

    function patch(n1, n2, container, anchor = null) {
        if (n1 === n2) {
            return;
        }
        // debugger;
        // 更新 1. 如果前后完全没有关系， 删除老的，添加新的
        if (n1 && !isSameVNode(n1, n2)) {
            unmount(n1);
            n1 = null;
        }
        const {type, shapeFlag} = n2;
        // 更新 2. 添加新的，首次渲染也走这里
        switch(type) {
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, anchor);
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

    function processElement(n1, n2, container, anchor) {
        if (n1 == null) { // 元素初次渲染
            mountElement(n2, container, anchor);
        } else { // 元素更新
            patchElement(n1, n2, container);
        }
    }

    function mountElement(vnode, container, anchor) {
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
        hostInsert(el, container, anchor);
    }

    function mountChildren(children, container) {
        for (let i = 0; i < children.length; i++) {
            // children[i] 文本替换成 vnode Text 节点
            children[i] = normalizeVNode(children[i]);
            patch(null, children[i], container);
        }
    }

    function patchElement(n1, n2, container) {
        /**
         * 更新
         * 2. 老的和新的一样，复用。属性可能不一样，diff props
         * 3. 对比 children
         */
        const el = n2.el = n1.el;

        const oldProps = n1.props || {};
        const newProps = n2.props || {};

        patchProps(oldProps, newProps, el);

        patchChildren(n1, n2, el);
    }

    function patchProps(oldProps, newProps, el) {
        for (const key in newProps) {
            hostPatchProp(el, key, oldProps[key], newProps[key]);
        }
        for (const key in oldProps) {
            if (newProps[key] == null) {
                hostPatchProp(el, key, oldProps[key], null);
            }
        }
    }

    function patchChildren(n1, n2, el) {
        // 比较两个虚拟节点儿子的差异
        const c1 = n1.children;
        const c2 = n2.children;
        const preShapeFlag = n1.shapeFlag;
        const shapeFlag = n2.shapeFlag;

        // 文本, null, 数组
        //     老  ->  新
        // 1. 数组 -> 文本  删除老的节点，添加文本
        // 2. 文本 -> 文本  更新文本
        
        // 3. 数组 -> 数组  数组 diff
        // 4. 数组 -> null  删除所有节点

        // 5. 文本 -> null  清空文本
        // 6. 文本 -> 数组  删除文本，添加新的节点
        // 7. null -> 数组  添加新的节点
        
        // 8. null -> null  不做处理
        // diff
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 1. 数组 -> 文本 删除老的节点，添加文本
                unmountChildren(c1);
            } 
             // 添加文本
             // 2. 文本 -> 文本 更新文本
             if (c1 !== c2) {
                hostSetElementText(el, c2);
            }
        } else { // 数组 或 null
            if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    // 3. 数组 -> 数组  数组 diff
                    patchKeyedChildren(c1, c2, el);
                } else {
                    // 4. 数组 -> null  删除老的节点
                    unmountChildren(c1);
                }
            } else {
                // 5. 文本 -> null
                if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                    hostSetElementText(el, '');
                }
                // 6. 文本 -> 数组 删除文本，添加新的节点  
                // 7. null -> 数组 添加新的节点
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    mountChildren(c2, el);
                }

                // 8. null -> null  不做处理
            }
        }
    }

    function patchKeyedChildren(c1, c2, el) {
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        // 先对比前后相同节点
        // 从前往后比相同节点
        while (i <= e1 && i <= e2) { // 有任何一方停止循环，则直接跳出
            const n1 = c1[i];
            const n2 = c2[i] = normalizeVNode(c2[i]);
            if (isSameVNode(n1, n2)) {
                patch(n1, n2, el);
            } else {
                break;
            }
            i++;
        }
        // 从后往前比相同节点
        while (i <= e1 && i <= e2) { // 有任何一方停止循环，则直接跳出
            const n1 = c1[i];
            const n2 = c2[i] = normalizeVNode(c2[i]);
            if (isSameVNode(n1, n2)) {
                patch(n1, n2, el);
            } else {
                break;
            }
            e1--;
            e2--;
        }
        // 新增部分
        // i 如果比 e1 大， 说明有新增的
        // i 到 e2 之间是新增的部分
        if (i > e1) {
            // 新增部分
            if (i <= e2) {
                while(i <= e2) {
                    const nextPos = e2 + 1;
                    // 根据下一个人的索引来看参照物
                    const anchor = nextPos < c2.length ? c2[nextPos].el : null;
                    patch(null, c2[i], el, anchor); // 新增部分，创建元素，anchor 参照插入到哪个兄弟元素之前
                    i++;
                }
            }
        }
        // 卸载部分
        else if (i > e2) {
            if (i <= e1) {
                while(i <= e1) {
                    unmount(c1[i]);
                    i++;
                }
            }
        }

        // 乱序对比
        let s1 = i;
        let s2 = i;
        const keyToNewIndexMap = new Map();
        for (let j = s2; j <= e2; j++) {
            keyToNewIndexMap.set(c2[j].key, j);
        }
        // 循环老的元素看一下新的里面有没有，如果有说明要比较差异，没有要添加到列表中，老的有新的没有要删除
        const toBePatched = keyToNewIndexMap.size; // 乱序 新的总个数
        const newIndexToOldIndexMap = new Array(toBePatched).fill(0); // 记录是否patch对比过
        for (let k = s1; k <= e1; k++) {
            const oldChild = c1[k];
            const newIndex = keyToNewIndexMap.get(oldChild.key);
            if (!newIndex) {
                unmount(oldChild);
            } else {
                // 新的位置对应老的位置，记录已经 patch 过
                newIndexToOldIndexMap[newIndex - s2] = k + 1;
                patch(oldChild, c2[newIndex], el);
            }
        }
        // 需要移动位置
        for (let x = toBePatched - 1; x >= 0; x--) {
            let index = x + s2;
            let currentVNode = c2[index];
            let anchor = index + 1 < c2.length ? c2[index + 1].el : null;
            if (newIndexToOldIndexMap[x] === 0) { // 新增
                patch(null, currentVNode, el, anchor);
            } else { // 已经 patch 对比过 移动位置
                hostInsert(currentVNode.el, el, anchor);
            }
        }
    }

    function unmountChildren(children) {
        children.forEach(c => unmount(c));
    }

    function unmount(vnode) {
        hostRemove(vnode.el);
    }

    return {
        render
    };
}
