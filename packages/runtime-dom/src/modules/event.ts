
export function patchEvent(el, eventName, nextValue) {
    const invokers = el._vei || (el._vei = {}); // 事件缓存在元素 _vei 属性上

    const exits = invokers[eventName];

    if (exits && nextValue) { // exits 和 nextValue 都为 true => 更换绑定函数
        exits.value = nextValue;
    } else {
        const event = eventName.slice(2).toLowerCase();

        if (nextValue) { // nextValue 为 true，而 exits 为 false => 创建绑定函数
            const invoker = createInvoker(nextValue);
            el.addEventListener(event, invoker);
        } else if (exits) { // exits 为 true，而 nextValue 为 false => 移除绑定函数
            el.removeEventListener(event, exits);
            invokers[eventName] = undefined;
        } else { // nextValue 和 exits 都为 false => 无操作
            // ...
        }
    }
}


function createInvoker(callback) {
    const invoker = (e) => invoker.value(e);
    invoker.value = callback;
    return invoker;
}