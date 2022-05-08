import { test, expect } from 'vitest';
import {ref, computed} from '../src/';

test('ref get value', () => {
    const foo = ref(1);
    expect(foo.value).toMatchInlineSnapshot('1');
});

test('ref get value after set', () => {
    const foo = ref(1);
    foo.value = 2;
    expect(foo.value).toMatchInlineSnapshot('2');
});

test('ref and computed', () => {
    const foo = ref(1);
    const bar = computed(() => foo.value * 2);
    expect(bar.value).toMatchInlineSnapshot('2');
});