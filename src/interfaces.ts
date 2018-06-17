/**
 *
 * Public types
 *
 */

export interface IContainer {
  isServer: boolean;
  hasDependency(type: string | symbol): boolean;
  registerDependency(options: RegisterInjectableDecoratorOptions): boolean;
  registerInjection(injection: InjectionParam): number;
  registerInstance(provides: string | symbol, instance: Object): boolean;
  resolve(type: string | symbol): object | null;
}

/**
 * Describes the
 */
export interface InjectableDecoratorOptions {
  singleton: boolean;
  provides: string | symbol | null;
  requires: (string | symbol)[];
}

export interface InjectDecoratorOptions {
  requires: string | symbol;
  propertyKey: string | symbol;
}

/**
 *
 * Private types
 *
 */

// Helper type to keep Typescript happy when calling the types with new()
export declare type IConstructor = { new (...args: any[]): object };

// A private interface for recording metadata about the dependency.
export interface RegisterInjectableDecoratorOptions extends InjectableDecoratorOptions {
  klass: Function | null;
}

export interface Injectable {
  parent: symbol;
  requires?: (string | symbol)[] | null;
  klass: IConstructor | null;
  instance?: object | null;
  singleton: boolean;
}

export interface InjectionParam {
  target: Function;
  requires: string | symbol;
  parameterIndex: number;
  propertyKey: string | symbol | null;
  instance?: object | null;
}
