import { text } from 'stream/consumers';
import { test, expect } from 'vitest';
import {ref, computed, reactive, toRef, toRefs, proxyRefs} from '../src/';

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

test('toRef is work', () => {
    const obj = reactive({
        a: 1
    });
    const refA = toRef(obj, 'a');
    expect(refA.value).toMatchInlineSnapshot('1');
});

test('toRef is work after set', () => {
    const obj = reactive({
        a: 1
    });
    const refA = toRef(obj, 'a');
    refA.value = 2;
    expect(obj.a).toMatchInlineSnapshot('2');
    expect(refA.value).toMatchInlineSnapshot('2');
});

test('toRefs is work', () => {
    const obj = reactive({
        a: 1,
        b: 2
    });
    const {a, b} = toRefs(obj);
    expect(a.value).toMatchInlineSnapshot('1');
    expect(b.value).toMatchInlineSnapshot('2');
});

test('proxyRefs is work', () => {
    const foo = ref(1);
    const bar = ref(2);
    const pFooBar = proxyRefs({foo, bar});
    expect(pFooBar.foo).toBe(1);
    expect(pFooBar.bar).toBe(2);
});

test('proxyRefs is work after set', () => {
    const foo = ref(1);
    const bar = ref(2);
    const pFooBar = proxyRefs({foo, bar});
    pFooBar.foo = 10;
    pFooBar.bar = 20;
    expect(foo.value).toBe(10);
    expect(pFooBar.foo).toBe(10);
    expect(bar.value).toBe(20);
    expect(pFooBar.bar).toBe(20);
});
