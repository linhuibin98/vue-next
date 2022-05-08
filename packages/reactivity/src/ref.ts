import { isObject, isArray, IfAny } from '@vue/shared';
import { trackEffects, ReactiveEffect, triggerEffects } from './effect';
import { isReactive, reactive } from './reactive';

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
    private _value;
    public deps: Set<ReactiveEffect> = new Set();
    public readonly __v_isRef = true;

    constructor(private _rawValue: T) {
        this._value = toReactive(_rawValue);
    }

    get value(): T {
        trackEffects(this.deps);
        return this._value;
    }

    set value(newValue: T) {
        if (newValue !== this._rawValue) {
            this._value = toReactive(newValue);
            this._rawValue = newValue;
            triggerEffects(this.deps);
        }
    }
}

export function ref<T>(value: T) {
    return new RefImpl(value);
}

export function unref(valueWidthRef) {
    if (isRef(valueWidthRef)) {
        return valueWidthRef.value;
    } else {
        return valueWidthRef;
    }
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

export type ShallowUnwrapRef<T> = {
    [K in keyof T]: T[K] extends Ref<infer V>
      ? V
      : // if `V` is `unknown` that means it does not extend `Ref` and is undefined
      T[K] extends Ref<infer V> | undefined
      ? unknown extends V
        ? undefined
        : V | undefined
      : T[K];
};

const shallowUnwrapHandlers: ProxyHandler<any> = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
}

export function proxyRefs<T extends object>(
    objectWithRefs: T
): ShallowUnwrapRef<T> {
    return isReactive(objectWithRefs) 
        ? objectWithRefs 
        : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}