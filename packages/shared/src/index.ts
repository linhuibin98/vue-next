export * from './typeUtils';

export function isObject(value: any) {
    return value !== null && typeof value === 'object';
}

export function isFunction(value: unknown): value is Function {
    return typeof value === 'function';
}

export function isArray(value: unknown): value is Array<unknown> {
    return Array.isArray(value);
}

export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

export function sleep(time = 1000) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export function once(fn: Function) {
    let called = false;
    return function () {
        if (!called) {
            called = true;
            fn.apply(this, arguments);
        }
    }
}

export const enum ShapeFlags {
    ELEMENT = 1,
    FUNCTION_COMPONENT = 1 << 1,
    STATEFUL_COMPONENT = 1 << 2,
    TEXT_CHILDREN = 1 << 3,
    ARRAY_CHILDREN = 1 << 4,
    SLOTS_CHILDREN = 1 << 5,
    TELEPORT = 1 << 6,
    SUSPENSE = 1 << 7,
    COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
    COMPONENT_KEPT_ALIVE = 1 << 9,
    COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTION_COMPONENT,
}
