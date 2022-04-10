import {describe, test, expect} from 'vitest';
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

describe('effect schedule', () => {
    test('effect schedule', () => {
        const state = reactive({
            foo: 1,
            bar: 2,
            bzz: 3
        });
        let runCount = 0; // scheduler执行次数
        const runner = effect(() => {
            state.bar = state.foo * 2 + state.bzz;
        }, {
            scheduler: () => {
                runner();
                runCount++;
            }
        });
        state.foo = 2;
        state.bzz = 6;
        expect(state.bar).toMatchInlineSnapshot('10');
        expect(runCount).toMatchInlineSnapshot('2');
    });
});
