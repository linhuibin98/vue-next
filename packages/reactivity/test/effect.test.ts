import {test, expect} from 'vitest';
import {reactive} from '../src/reactive';
import {effect} from '../src/effect';

test('effect', () => {
    const state = reactive({
        foo: 1,
        bar: 2
    });
    effect(() => {
        state.bar = state.foo * 2;
    });

    state.foo = 2;

    expect(state.bar).toBe(4);
});