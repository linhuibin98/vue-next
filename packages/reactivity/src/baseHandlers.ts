import {ReactiveFlags} from './reactive';
import {track, trigger} from './effect';

export const mutableHandlers = {
    get(target, key, receiver) {
        // 已经代理过的标识
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true;
        }
        track(target, 'get', key);
        return Reflect.get(target, key, receiver);
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