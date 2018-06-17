// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"

import InjectorInstance from './injector';
export { InjectorInstance as DefaultInjector };
export { Injector } from './injector';
export { DependencyContainer, DependencyContainerOptions } from './container';
export { Injectable } from './injectable';
export { Inject } from './inject';
export { InjectProp } from './inject-prop';

export { InjectDecoratorOptions, InjectableDecoratorOptions, IContainer } from './interfaces';
