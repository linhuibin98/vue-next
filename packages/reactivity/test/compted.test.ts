import {describe, it, expect} from 'vitest';
import { reactive } from '../src/reactive';
import {computed} from '../src/computed';

describe('computed', () => {
    it('computed ref', () => {
        const state = reactive({
            a: 1
        });

        const b = computed(() => {
            return state.a * 2;
        });
        expect(b.value).toMatchInlineSnapshot('2');
        state.a = 2;
        expect(b.value).toMatchInlineSnapshot('4');
    });
});