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
    ELEMENT = 1, // 1 => 元素
    FUNCTION_COMPONENT = 1 << 1, // 2 => 函数组件
    STATEFUL_COMPONENT = 1 << 2, // 4 => 状态组件
    TEXT_CHILDREN = 1 << 3, // 8 => 文本子节点
    ARRAY_CHILDREN = 1 << 4, // 16 => 数组子节点
    SLOTS_CHILDREN = 1 << 5, // 32 => 插槽子节点
    TELEPORT = 1 << 6, // 64 => teleport
    SUSPENSE = 1 << 7, // 128 => suspense
    COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 256 => component should keep alive
    COMPONENT_KEPT_ALIVE = 1 << 9, // 512 => component is kept-alive. Only used with `<keep-alive>`
    COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTION_COMPONENT, // 6 => 组件
}
