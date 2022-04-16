import {reactive,ReactiveFlags} from './reactive';
import {track, trigger} from './effect';
import {isObject} from '@vue/shared';

export const mutableHandlers = {
    get(target, key, receiver) {
        // 已经代理过的标识
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true;
        }
        track(target, 'get', key);
        const res = Reflect.get(target, key, receiver);
        // 深度代理，取值的时候再代理，不用像vue2那样，初始化时就深度代理
        if (isObject(res)) {
            return reactive(res);
        }
        return res;
    },
    set(target, key, value, receiver) {
        const oldValue = target[key];
        const result = Reflect.set(target, key, value, receiver);
        if (oldValue !== value) {
            trigger(target, 'set', key);
        }
        return result;
    }
};