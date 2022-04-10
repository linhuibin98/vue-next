
export let activeEffect: ReactiveEffect | undefined; // 暴露全局，保存当前正在进行的依赖收集的ReactiveEffect
class ReactiveEffect<T = any> {
    /**
     * parent
     * 解决 effect嵌套的导致activeEffect不正确的问题
     * @example
     * ```ts
     * effect(() => {
        // 此时 activeEffect = ReactiveEffect1
          effect(() => {
            // 此时 activeEffect = ReactiveEffect2
          });
          // 再这里时，activeEffect = this.parent,交还给父级ReactiveEffect
      })
     ```
     */
    public parent: ReactiveEffect | undefined = undefined;
    /**
     * ReactiveEffect和 target、key双向绑定
     * 保存该ReactiveEffect，被哪些属性关联
     * 用于停止watch的，取消关联
     * @example
     ```ts
     deps = [Set([ReactiveEffect1, ReactiveEffect2])]
     ```
     */
    public deps = [];
    public active = true; // effect默认是激活的状态，表示需要进行依赖收集
    constructor(
        public fn: () => T,
        public scheduler: EffectScheduler | null = null
    ) {}

    run() {
        // effect非激活状态，只需要执行fn，不需要进行依赖收集
        if (!this.active) {
            return this.fn();
        }
        // 依赖收集
        // 核心就是将当前的 effect 和 稍后渲染的属性关联在一起
        try {
            // 保存父级ReactiveEffect，此时只有在effect嵌套使用时才有值
            this.parent = activeEffect;
            activeEffect = this;
            // 执行回调之前，先清空收集的依赖
            cleanupEffect(this);
            return this.fn(); // 执行fn进行依赖收集,即稍后渲染的属性
        } finally {
            // 依赖收集之后，activeEffect置为undefined
            // 若存在effect嵌套，则activeEffect交还给父级ReactiveEffect
            activeEffect = this.parent;
        }
    }

    stop() {
        if (this.active) {
            this.active = false; // 停止reactiveEffect收集
            cleanupEffect(this); // 清空已经收集的依赖
        }
    }
}

export function cleanupEffect(effect: ReactiveEffect) {
    const {deps} = effect;
    for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect);
    }
    effect.deps.length = 0;
}

export type EffectScheduler = (...args: any[]) => any
export interface ReactiveEffectOptions {
    scheduler?: EffectScheduler
  }

export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions) {
    const scheduler = options?.scheduler ?? null;
    const _effect = new ReactiveEffect(fn, scheduler); // 创建响应式effect
    // 默认先执行一次
    _effect.run();

    const runner = _effect.run.bind(_effect);
    runner.effect = _effect; // 将effect挂载在runner上
    return runner;
}

/**
 * 依赖收集
 * @example
 ```ts
 // targetMap的数据结构
 {
     target: {
         key: [ReactiveEffect1, ReactiveEffect2]
     }
 }
 ```
 */
const targetMap = new WeakMap<any, Map<string | symbol, Set<ReactiveEffect>>>();

/**
 * 代理对象读取属性时，会触发getter，进行依赖收集
 * 一个reactiveEffect对应多个属性，一个属性对应过个reactiveEffect
 * @param target 代理的原对象
 * @param type 操作类型，'get',用于调试
 * @param key  属性名   
 */
export function track(target: object, type: 'get', key: string | symbol) {
    if (!activeEffect) { 
        return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let deps = depsMap.get(key);
    if (!deps) {
        depsMap.set(key, (deps = new Set()));
    }
    const shouldTrack = !deps.has(activeEffect);
    if (shouldTrack) {
        deps.add(activeEffect);
        activeEffect.deps.push(deps);
    }
}

/**
 * target属性更新值时触发setter，遍历执行当前key收集的ReactiveEffect
 * @param target 代理的原对象
 * @param type 操作类型，'set',用于调试
 * @param key 属性名
 */
export function trigger(target: object, type: 'set', key: string | symbol) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        return;
    }
    let effects = depsMap.get(key);
    if (!effects) {
        return;
    }
    // clone effects
    effects = new Set(effects);
    effects.forEach(effect => {
        /**
         * 如果effect中又对target属性触发trigger，则会导致死循环
         * @example
         ```ts
            const state = reactive({
                age: 16
            });

            effect(() => {
                state.age += 1; // state.age触发 trigger 2，此时会导致死循环，所以排除当前触发的reactiveEffect
            });

            setTimeout(() => {
                state.age = 18; // state.age先触发 trigger 1
            });
         ```
         */
        if (effect === activeEffect) {
            return;
        }
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    });
}