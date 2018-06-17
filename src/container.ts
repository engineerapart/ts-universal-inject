import {
  IConstructor,
  IContainer,
  Injectable,
  InjectionParam,
  RegisterInjectableDecoratorOptions
} from './interfaces';
import { isSymbol } from './utils';

export interface DependencyContainerOptions {
  isServer?: boolean;
}

const log = console;
export class DependencyContainer implements IContainer {
  private _isServer = false;
  private dependencyRegistry = new Map<symbol, Injectable>();
  private injectionsRegistry = new Map<Function, InjectionParam[]>(); // Function vs object: the eternal struggle

  constructor(options: DependencyContainerOptions = {}) {
    this._isServer = !!options.isServer;
  }

  get isServer() {
    return this._isServer;
  }

  hasDependency = (type: string | symbol) => {
    const depSymbol = typeof type === 'string' ? Symbol.for(type) : (type as symbol);
    return !!this.dependencyRegistry.get(depSymbol);
  };

  registerDependency = (options: RegisterInjectableDecoratorOptions) => {
    if (this.dependencyRegistry.get((options.provides as symbol) as symbol)) {
      return false;
    }

    this.dependencyRegistry.set(options.provides as symbol, {
      parent: options.provides as symbol,
      klass: options.klass as IConstructor,
      requires: options.requires,
      instance: null,
      singleton: options.singleton
    });

    return true;
  };

  registerInjection = (injection: InjectionParam) => {
    const injections = this.injectionsRegistry.get(injection.target) || [];
    const index = injections.push(injection);
    this.injectionsRegistry.set(injection.target, injections);
    return index - 1;
  };

  registerInstance = (provides: string | symbol, instance: Object) => {
    if (typeof instance !== 'object' && typeof instance !== 'function') {
      throw new Error('The argument passed was an invalid type.');
    }
    const resolvedType = isSymbol(provides) ? (provides as symbol) : Symbol.for(provides as string);
    if (this.hasDependency(resolvedType)) {
      return false;
    }
    this.dependencyRegistry.set(resolvedType, {
      parent: resolvedType,
      klass: null,
      requires: null,
      instance,
      singleton: true
    });
    return true;
  };

  resolve = (type: string | symbol): object | null => {
    const depSymbol = typeof type === 'string' ? Symbol.for(type) : (type as symbol);
    const entry: Injectable | null = this.findDependencyEntrySymbol(depSymbol);

    if (entry) {
      // Return the singleton entry, unless we are on the server.
      // On the server we always want a new instance.
      if (entry.instance && entry.singleton && !this.isServer) {
        return entry.instance;
      }

      // If there is an entry for the type in injectionsRegistry
      let instance = this.resolveInjections(entry);

      // Otherwise, use entry.requires, and spread in order provided, and consumer has to
      // store the instances themselves.
      if (!instance) {
        instance = this.resolveRequires(entry);
      }

      if (!instance) {
        throw new Error(
          `DependencyContainer: type '${Symbol.keyFor(
            depSymbol
          )}' is not known and cannot be injected.`
        );
      }

      entry.instance = instance;
      return entry.instance;
    }

    // Throw an exception here for not being registered. I debated simply logging and returning
    // null, but this is a developer error so failing fast helps fix fast.
    throw new Error(
      `DependencyContainer: type '${Symbol.keyFor(depSymbol)}' is not known and cannot be injected.`
    );
  };

  resolveAll = (...classes: (string | symbol)[]) => {
    return classes.map(this.resolve);
  };

  private resolveInjections = (entry: Injectable): null | object => {
    if (!entry.klass) {
      return null;
    }
    // Here we use entry.klass, but we know that Injectable's entry.klass
    // and InjectionParam's entry.target are the same object.
    const injectionParams = this.injectionsRegistry.get(entry.klass);

    // We don't know this class, no injections were decorated on its constructor.
    if (!injectionParams || !injectionParams.length) {
      return null;
    }

    if (entry.requires && entry.requires.length > 0) {
      // If BOTH injections & requires are provided, log an error, and use entry.requires
      log.warn(
        `DependencyContainer: type '${Symbol.keyFor(
          entry.parent
        )}' is decorated with 'requires' and also contains constructor injections. ` +
          'This combination produces undefined behavior and will fall back to using the requires. Please choose one or the other.'
      );
      return null;
    }

    if (entry.klass.length !== injectionParams.length) {
      log.warn(
        `Class '${Symbol.keyFor(entry.parent)}' has been provided ${
          injectionParams.length
        } constructor arguments, but the constructor requires ${entry.klass.length}. ` +
          'This will produced undefined behavior, please review your declarations.'
      );
    }

    // resolve the types for the requested class.
    const resolvedRequires = injectionParams
      .sort((l, r) => l.parameterIndex - r.parameterIndex)
      .map(injection => {
        injection.instance = this.isServer
          ? this.resolve(injection.requires)
          : injection.instance || this.resolve(injection.requires);
        return injection.instance;
      });

    const instance = new entry.klass(...resolvedRequires) as { [key: string]: any };
    // Spread the params into the instance.
    injectionParams.forEach(param => {
      if (param.propertyKey) {
        // Actually this may not be a string, it may be a symbol.
        // We'll worry about that when we can actually use it.
        instance[param.propertyKey as string] = resolvedRequires[param.parameterIndex];
      }
    });

    return instance;
  };

  private resolveRequires = (entry: Injectable) => {
    if (!entry.klass) {
      return null;
    }
    const instance = new entry.klass(...this.resolveAll(...(entry.requires || [])));
    return instance;
  };

  private findDependencyEntrySymbol = (depSymbol: symbol): Injectable | null => {
    const symbolStr = Symbol.keyFor(depSymbol);
    let entry: Injectable | null = null;
    // Standard equality won't work - symbol equality doesn't work like you expect.
    // const entry = this.dependencyRegistry.get(depSymbol);
    // Instead, need to find it by iterating over the symbols and comparing their keys.
    this.dependencyRegistry.forEach((v, k) => {
      if (entry) {
        return;
      }
      const entrySymbolStr = Symbol.keyFor(k);
      if (entrySymbolStr === symbolStr) {
        entry = v;
      }
    });
    return entry;
  };
}
