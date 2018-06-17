import { IContainer } from './interfaces';
import { DependencyContainer } from './container';

// On the server, Stencil provides the Context globally on the jsdom Window.
// Keep an eye on if this changes - we will need to ask them for another API to determine this,
// since testing for window won't work (jsdom provides one).
declare var Context: any;
const isServer =
  (typeof Context !== 'undefined' && Context.isServer) || // stencil apps
  typeof window === 'undefined'; // vanilla JS, React, Vue, Angular

export class Injector {
  private static _instance: Injector;
  private _diContainer: IContainer | null = null;

  get container(): IContainer | null {
    return this._diContainer;
  }

  set container(v: IContainer | null) {
    this._diContainer = v || null;
  }

  constructor(container?: IContainer) {
    this._diContainer = container || null;
  }

  static get instance() {
    if (!Injector._instance) {
      Injector._instance = new Injector(new DependencyContainer({ isServer }));
    }
    return Injector._instance;
  }

  static getContainer() {
    return Injector.instance._diContainer;
  }

  static setContainer(v: IContainer) {
    Injector.instance._diContainer = v;
  }
}

// Export a singleton for managing the global container.
// Set the default global container to DependencyContainer.
// Consumers can override this behavior.
// This is now done at the app level.
// import { DependencyContainer } from './container';
export default new Injector(new DependencyContainer({ isServer }));
