import { test, expect } from 'vitest';
import { reactive } from '../src/reactive';

test('reactive instanceof proxy true', () => {
    const target = {a: 1};
    const proxy = reactive(target);
    expect(proxy instanceof Proxy).toBe(true);
});