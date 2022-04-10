
export function isObject(value: any) {
    return value !== null && typeof value === 'object';
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
