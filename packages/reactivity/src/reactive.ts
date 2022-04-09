import { isObject } from '@vue/shared';

// TODO 完善ts类型

export const enum ReactiveFlags {
    IS_REACTIVE = '_v_isReactive',
}

// 保存已经代理的对象，原对象最为key，代理对象proxy为value
const reactiveMap = new WeakMap<any, any>();

export function reactive(target: any) {
    // 如果target不是对象，则直接返回target
    if (!isObject(target)) {
        return target;
    }
    // 如果target是代理对象，不需要重复代理
    if (target[ReactiveFlags.IS_REACTIVE]) {
        return target;
    }
    // 如果target已经被代理过，则直接返回代理对象
    const existingProxy = reactiveMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }

    const proxy = new Proxy(target, {
        get(target, key, receiver) {
            // 已经代理过的标识
            if (key === ReactiveFlags.IS_REACTIVE) {
                return true;
            }
            return Reflect.get(target, key, receiver);
        },
        set(target, key, value, receiver) {

            return Reflect.set(target, key, value, receiver);
        }
    });
    // 保存已经代理的对象
    reactiveMap.set(target, proxy);

    return proxy;
}