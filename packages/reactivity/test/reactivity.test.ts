import { test, expect } from 'vitest';
import { reactive, ReactiveFlags } from '../src/reactive';

test('reactive object has proxy flag', () => {
    const target = {a: 1};
    const proxy = reactive(target);
    expect(proxy[ReactiveFlags.IS_REACTIVE]).toBe(true);
});