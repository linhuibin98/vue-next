import {describe, it, expect} from 'vitest';
import {reactive, watch} from '../src';

describe('watch', () => {
    it('watch reactive key', () => {
        const state = reactive({
            a: 1
        });
        let b = 2;
        const stopWatch = watch(() => state.a, (newValue) => {
            b = newValue * 2;
        });
        expect(b).toMatchInlineSnapshot('2');
        state.a = 2;
        expect(b).toMatchInlineSnapshot('4');
        stopWatch();
        state.a = 4;
        expect(b).toMatchInlineSnapshot('4');
    });
});