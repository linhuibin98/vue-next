import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

export function patchProp(el, key, preValue, nextValue) {
    // 类名 el.className
    if (key === 'class') {
        patchClass(el, nextValue);
    }
    // 样式 el.style
    else if (key === 'style') {
        patchStyle(el, preValue, nextValue);
    }
    // 事件 el.addEventListener
    else if (/^on[A-Z]/.test(key)) {
        patchEvent(el, key, nextValue);
    }
    // 普通属性 el.setAttribute
    else {
        patchAttr(el, key, nextValue);
    }
}
