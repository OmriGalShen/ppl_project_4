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

export function lazyFilter<T>(genFn: () => Generator<T>, filterFn: (v:T)=>boolean): () => Generator<T> {
    const generator = genFn();
    
    return (function*(){
        let val:T= generator.next().value;
        while(val !== undefined){
            if(filterFn(val)) yield val;
            val = generator.next().value;
        }  
    })
}

export function lazyMap<T, R>(genFn: () => Generator<T>, mapFn: (v:T)=>R): () => Generator<R> {
    const generator = genFn();
    
    return (function*(){
        let val:T= generator.next().value;
        while(val !== undefined){
            yield mapFn(val);
            val = generator.next().value;
        }  
    })
}

/* 2.4 */
// you can use 'any' in this question

const sleep = (timeout:number) => new Promise(resolve => setTimeout(resolve, timeout));

const tryThreeTimes = async (func:(v:any)=>Promise<any>, v:any):Promise<any> => {
    try{
        const res = await func(v);
        return res;
    }
    catch(e){
        await sleep(200);
        try{
            const res = await func(v);
            return res;
        }
        catch(e){
            await sleep(200);
            return await func(v);
        }
    }
}

export async function asyncWaterfallWithRetry(fns: [() => Promise<any>, ...((v:any)=>Promise<any>)[]]): Promise<any> {
    let res;
    for (let fnc of fns) {
        res = await tryThreeTimes(fnc,res);
    }
    return res;
}
