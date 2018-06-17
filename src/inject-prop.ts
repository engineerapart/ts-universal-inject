import { InjectDecoratorOptions } from './interfaces';
import { Injector } from './injector';
import { resolveInjectDep } from './utils';

const SETTER_METADATA = '__inject_props_meta_';

export function InjectProp(depOrOpts: InjectDecoratorOptions | string | symbol): PropertyDecorator {
  const dep = resolveInjectDep(depOrOpts);

  return function InjectPropDecorator(target: Object, propertyKey: string | symbol): void {
    // Cast propertyKey to any here due to TS currently not supporting Symbols as index types,
    // in contract to JS' full support for this..
    let val = (target as { [key: string]: any })[propertyKey as any];

    const getter = function(this: any) {
      const container = Injector.getContainer();
      if (!container) {
        console.warn(
          'Type getter was invoked without a DI container available. This most likely occurs in a test environment.'
        );
        return null;
      }
      // On client, return the prototype's prop.
      if (!container.isServer) {
        if (!val) {
          val = container.resolve(dep);
        }
        return val;
      }

      // On server, return the prop per-instance.
      // Will it ever be the case that 'this' is not defined? If so we can just
      // return the Injector resolve without trying to set the property, which has the
      // effect of setting the value on the TYPE, not the instance.
      // Tag the object that this getter has run so we can optimize the resolver.
      if (!this.SETTER_METADATA) {
        this.SETTER_METADATA = SETTER_METADATA;
        // Replace the prototype getter with an instance data descriptor
        // so that the instance is reused for this instance of the target object.
        Object.defineProperty(this, propertyKey, {
          value: container.resolve(dep),
          enumerable: true
        });
      }
      return this[propertyKey];
    };

    Object.defineProperty(target, propertyKey, {
      get: getter,
      enumerable: true,
      configurable: true
    });
  };
}
