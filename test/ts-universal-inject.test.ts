import { DependencyContainer } from '../src/index';

/**
 * Dummy test
 */
describe('Dummy test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy();
  });

  it('DependencyContainer is instantiable', () => {
    expect(new DependencyContainer()).toBeInstanceOf(DependencyContainer);
  });
});
