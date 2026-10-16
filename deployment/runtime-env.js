import {AsyncLocalStorage} from 'node:async_hooks';
const storage=new AsyncLocalStorage();
// The compiled learning routes import this proxy instead of cloudflare:workers.
// A request can never read another request's identity or bindings.
export const env=new Proxy({}, {get(_target,key){return storage.getStore()?.[key];}});
export const withEnvironment=(bindings,task)=>storage.run(bindings,task);
