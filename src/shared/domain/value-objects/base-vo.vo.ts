/**
 * BaseVo value object
 */
export abstract class BaseVo<T> {
  protected readonly value: T;

  protected constructor(value: T) {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }
}
