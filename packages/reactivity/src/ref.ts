import { isObject } from '@vue/shared';
import { trackEffects, ReactiveEffect, triggerEffects } from './effect';
import { reactive } from './reactive';

function toReactive(value) {
    return isObject(value) ? reactive(value) : value; 
}

export class RefImpl<T> {
    public _value;
    public deps: Set<ReactiveEffect> = new Set();
    public __v_isRef = true;

    constructor(public rawValue: T) {
        this._value = toReactive(rawValue);
    }

    get value(): T {
        trackEffects(this.deps);
        return this._value;
    }

    set value(newValue: T) {
        if (newValue !== this.rawValue) {
            this._value = toReactive(newValue);
            this.rawValue = newValue;
            triggerEffects(this.deps);
        }
    }
}

export function ref<T>(value: T) {
    return new RefImpl<T>(value);
}