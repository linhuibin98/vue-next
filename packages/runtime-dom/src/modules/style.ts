
export function patchStyle(el, preValue, nextValue) {
    // 样式需要对比差异
    for (const key in nextValue) {
        // 用新的直接覆盖旧的
        el.style[key] = nextValue[key];
    }
    // 对比删除的样式
    if (preValue) {
        for (const key in preValue) {
            if (nextValue[key] == null) {
                el.style[key] = null;
            }
        }
    }
}
