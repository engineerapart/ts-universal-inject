import { InjectDecoratorOptions } from './interfaces';
import { Injector } from './injector';
import { resolveInjectDep } from './utils';

export function Inject(depOrOpts: InjectDecoratorOptions | string | symbol): ParameterDecorator {
  const dep = resolveInjectDep(depOrOpts);
  // const resolvedPropertyKey = typeof depOrOpts === 'object' ? depOrOpts.propertyKey : propertyKey;

  // Until this issue is fixed, we cannot properly get propertyKey from the parameter list.
  // https://github.com/Microsoft/TypeScript/issues/20931
  // For now the workaround is simply to set an access modifier on the property. Typescript will emit
  // the setter for you: @Inject(TService) public someProp: TService;
  return function InjectDecorator(
    target: Object,
    _badPropertyKey: string | symbol,
    parameterIndex: number
  ): void {
    const container = Injector.getContainer();
    if (!container) {
      return;
    }
    container.registerInjection({
      target: target as Function,
      propertyKey: null, // resolvedPropertyKey,
      parameterIndex,
      requires: dep
    });

    // Apply the solution in inject-prop when we can use this.
    // if (resolvedPropertyKey) {
    //   let val = target[resolvedPropertyKey];
    //   const getter = function() {
    //     if (!val) {
    //       val = Injector.container.resolve(dep);
    //     }
    //     return val;
    //   };
    //   Object.defineProperty(target, resolvedPropertyKey, {
    //     get: getter,
    //   });
    // }
  };
}

export const Import = Inject;
