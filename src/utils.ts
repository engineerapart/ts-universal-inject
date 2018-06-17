import { InjectDecoratorOptions } from './interfaces';

export const isSymbol = function(x: any) {
  if (!x) return false;
  if (typeof x === 'symbol') return true;
  if (!x.constructor) return false;
  if (x.constructor.name !== 'Symbol') return false;
  return x[x.constructor.toStringTag] === 'Symbol';
};

export function resolveInjectDep(depOrOpts: InjectDecoratorOptions | string | symbol): symbol {
  const dep = typeof depOrOpts === 'object' ? depOrOpts.requires : depOrOpts;
  const result = typeof dep === 'string' ? Symbol.for(dep) : (dep as symbol);
  return result;
}
