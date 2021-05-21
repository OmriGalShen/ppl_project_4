/* 2.1 */

export const MISSING_KEY = "___MISSING___";

type PromisedStore<K, V> = {
  get(key: K): Promise<V>;
  set(key: K, value: V): Promise<void>;
  delete(key: K): Promise<void>;
};

export function makePromisedStore<K, V>(): PromisedStore<K, V> {
  const store: Map<K, V> = new Map<K, V>();
  return {
    get(key: K) {
      return new Promise<V>((resolve, reject) => {
        const val = store.get(key);
        if (val !== undefined) resolve(val);
        else reject(MISSING_KEY);
      });
    },
    set(key: K, value: V) {
      return new Promise<void>((resolve, reject) => {
        store.set(key, value);
        resolve();
      });
    },
    delete(key: K) {
      return new Promise<void>((resolve, reject) => {
        if (store.has(key)) {
          store.delete(key);
          resolve();
        } else reject(MISSING_KEY);
      });
    },
  };
}

export function getAll<K, V>(
  store: PromisedStore<K, V>,
  keys: K[]
): Promise<V[]> {
  return Promise.all(keys.map((key: K) => store.get(key)));
}

/* 2.2 */


const asycMemoHelper =
  <T, R>(
    store: PromisedStore<T, R>,
    f: (param: T) => R
  ): ((param: T) => Promise<R>) =>
  async (param: T) => {
    try {
      const res = await store.get(param);
      return store.get(param);
    } catch (e) {
      const val = f(param);
      store.set(param, val);
      return store.get(param);
    }
  };

export function asycMemo<T, R>(f: (param: T) => R): (param: T) => Promise<R> {
  const store: PromisedStore<T, R> = makePromisedStore<T, R>();
  return asycMemoHelper(store, f);
}
/* 2.3 */

// export function lazyFilter<T>(genFn: () => Generator<T>, filterFn: ???): ??? {
//     ???
// }

// export function lazyMap<T, R>(genFn: () => Generator<T>, mapFn: ???): ??? {
//     ???
// }

/* 2.4 */
// you can use 'any' in this question

// export async function asyncWaterfallWithRetry(fns: [() => Promise<any>, ...(???)[]]): Promise<any> {
//     ???
// }
