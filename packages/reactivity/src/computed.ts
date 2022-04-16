import {isFunction} from '@vue/shared';
import {ReactiveEffect, trackEffects, triggerEffects} from './effect';

export type ComputedGetter<T> = (...args: any[]) => T;
export type ComputedSetter<T> = (v: T) => void;
export interface WritableComputedOptions<T> {
    get: ComputedGetter<T>
    set: ComputedSetter<T>
}

export class ComputedRefImpl<T> {
    public effect: ReactiveEffect;
    public _dirty = true; // 是否重新计算，默认为true，第一次计算
    public __v_isReadonly = true;
    public __v_isRef = true;
    public _value; // 内部value
    public deps: Set<ReactiveEffect> = new Set(); // 依赖收集
    constructor(getter: ComputedGetter<T>, public setter: ComputedSetter<T>) {
        this.effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true;
                triggerEffects(this.deps);
            }
        });      
    }

    get value() {
        // 依赖收集
        trackEffects(this.deps);
        if (this._dirty) {
            this._dirty = false;
            this._value = this.effect.run();
        }
        return this._value;
    }

    set value(newValue: T) {
        this.setter(newValue);
    }
}

export function computed<T>(getter: ComputedGetter<T>)
export function computed<T>(options: WritableComputedOptions<T>) 
export function computed<T>(getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>) {
    const onlyGetter = isFunction(getterOrOptions);
    let getter: ComputedGetter<T>, setter: ComputedSetter<T>;
    if (onlyGetter) {
        getter = getterOrOptions;
        setter = () => console.warn('[vue computed]: computed value is readonly.');
    } else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    return new ComputedRefImpl<T>(getter, setter);
}