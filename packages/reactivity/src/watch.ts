import { isFunction, isObject } from '@vue/shared';
import { ReactiveEffect } from './effect';
import { isReactive } from "./reactive";

export function traversal(value, set = new Set()) {
    // 不是对象，则结束递归
    if (!isObject(value)) {
        return value;
    }
    // 处理循环引用的问题
    if (set.has(value)) {
        return value;
    }
    set.add(value);
    for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
            traversal(value(key));
        }
    }
    return value;
}

export function watch(source, cb) {
    let getter;
    if (isReactive(source)) {
        // traversal对传入的属性进行深度递归访问，收集每个对象属性的依赖
        getter = () => traversal(source);
    } else if (isFunction(source)) {
        getter = source;
    } else {
        return;
    }
    let cleanup;
    const onCleanup = (fn) => {
        cleanup = fn;
    } 
    const effect = new ReactiveEffect(getter, job);
    let oldValue = effect.run();
    function job() {
        if (cleanup) {
            cleanup();
        }
        const newValue = effect.run()
        cb(newValue, oldValue, onCleanup);
        oldValue = newValue;
    }
    return () => effect.stop();
}