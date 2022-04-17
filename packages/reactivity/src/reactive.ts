import { isObject } from '@vue/shared';
import { mutableHandlers } from './baseHandlers';

// TODO 完善ts类型

export const enum ReactiveFlags {
    IS_REACTIVE = '_v_isReactive',
}

// 保存已经代理的对象，原对象最为key，代理对象proxy为value
const reactiveMap = new WeakMap<any, any>();

export function reactive<T extends object>(target: T): T{
    // 如果target不是对象，则直接返回target
    if (!isObject(target)) {
        return target;
    }
    // 如果target是代理对象，不需要重复代理
    if (isReactive(target)) {
        return target;
    }
    // 如果target已经被代理过，则直接返回代理对象
    const existingProxy = reactiveMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }

    const proxy = new Proxy(target, mutableHandlers);
    // 保存已经代理的对象
    reactiveMap.set(target, proxy);

    return proxy;
}

export function isReactive(value: any)  {
    return Boolean(value && value[ReactiveFlags.IS_REACTIVE])
}