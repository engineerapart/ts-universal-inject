import { InjectableDecoratorOptions, RegisterInjectableDecoratorOptions } from './interfaces';
import { Injector } from './injector';
import { isSymbol } from './utils';

export function Injectable(options: InjectableDecoratorOptions | string | symbol): ClassDecorator {
  let opts: RegisterInjectableDecoratorOptions = {
    singleton: true,
    requires: [],
    provides: null,
    klass: null
  };

  if (typeof options === 'object') {
    const tOpts = { ...options };
    if (typeof tOpts.provides === 'string' && tOpts.provides) {
      tOpts.provides = Symbol.for(tOpts.provides);
    }
    opts = { ...opts, ...tOpts };
  } else if (isSymbol(options)) {
    // implicity means they are not requiring any dependencies, just declaring one.
    opts = { ...opts, provides: options };
  } else if (typeof options === 'string' && options) {
    opts = { ...opts, provides: Symbol.for(options) };
  }

  // Return the actual decorator
  return function InjectableDecorator(target: Function) {
    opts.klass = target;
    const container = Injector.getContainer(); // don't ask, uglify-es :(
    container && container.registerDependency(opts);
  };
}
