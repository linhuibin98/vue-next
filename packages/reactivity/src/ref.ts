import { isObject, isArray, IfAny } from '@vue/shared';
import { trackEffects, ReactiveEffect, triggerEffects } from './effect';
import { reactive } from './reactive';

declare const RefSymbol: unique symbol;

export interface Ref<T = any> {
  value: T
  /**
   * Type differentiator only.
   * We need this to be in public d.ts but don't want it to show up in IDE
   * autocomplete, so we use a private Symbol instead.
   */
  [RefSymbol]: true
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

export function toReactive(value) {
    return isObject(value) ? reactive(value) : value; 
}

export function isRef<T>(r: Ref<T> | unknown): r is Ref<T>;
export function isRef(r: any): r is Ref {
    return Boolean(r && r.__v_isRef === true);
}

export class ObjectRefImpl<T extends object, K extends keyof T> {
    public readonly __v_isRef = true;

    constructor(
        private readonly _object: T, 
        private readonly _key: K,
        private readonly _defaultValue?: T[K]
    ) {}

    get value() {
        const val = this._object[this._key];
        return val === undefined ? this._defaultValue : val;
    }

    set value(newVal) {
        this._object[this._key] = newVal;
    }
}

export type ToRef<T> = IfAny<T, Ref<T>, [T] extends [Ref] ? T : Ref<T>>;

export function toRef<T extends object, K extends keyof T>(object: T, key: K) {
    return new ObjectRefImpl<T, K>(object, key);
}

export type ToRefs<T = any> = {
    [K in keyof T]: ToRef<T[K]>
}

export function toRefs<T extends object>(object: T): ToRefs<T> {
    const result: any = isArray(object) ? new Array(object.length) : {};

    for (const key in object) {
        result[key] = toRef(object, key);
    }

    return result;
}
