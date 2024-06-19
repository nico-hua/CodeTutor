import DataStructureObject from './dataStructure';
import { LiteralObject } from './literal';

export class ArrayObject<T> extends DataStructureObject {
  [index: number]: T;

  static Event = {
    GET: Symbol('get'),
    UPDATE: Symbol('update'),
    ADD: Symbol('add'),
    REMOVE: Symbol('remove'),
    SWAP: Symbol('swap'),
    SLICE: Symbol('slice'),
    COMPARE: Symbol('compare'),
  };

  constructor(id: string, private values: Array<any> = []) {
    super(id, 'array');
  }

  override copy(id?: string): ArrayObject<T> {
    if (id === undefined) {
      id = this.id;
    }
    return new ArrayObject(id, this.values.slice());
  }

  override check(...others: DataStructureObject[]): boolean {
    return others.every(
      (other) => other instanceof ArrayObject || other instanceof LiteralObject
    );
  }

  override accept(...others: DataStructureObject[]): void {
    others.forEach((other) => {
      if (other instanceof ArrayObject) {
        this.values.push(...other.values);
      } else if (other instanceof LiteralObject) {
        this.values.push(other.value);
      }
    });  
  }

  get length() {
    return this.values.length;
  }

  [Symbol.iterator]() {
    return this.values.values();
  }

  get(index: number): T {
    const value = this.values[index];
    this.notify(ArrayObject.Event.GET, index, value);
    return value;
  }

  set(index: number, value: T): void {
    const oldValue = this.values[index];
    this.values[index] = value;
    this.notify(ArrayObject.Event.UPDATE, index, value, oldValue);
  }

  push(...items: T[]) {
    const length = this.values.length;
    this.values.push(...items);
    this.notify(ArrayObject.Event.ADD, length, ...items);
    return this.values.length;
  }

  unshift(...items: T[]) {
    this.values.unshift(...items);
    this.notify(ArrayObject.Event.ADD, 0, ...items);
    return this.values.length;
  }

  pop() {
    const item = this.values.pop();
    this.notify(ArrayObject.Event.REMOVE, this.values.length, item);
    return item;
  }

  shift() {
    const item = this.values.shift();
    this.notify(ArrayObject.Event.REMOVE, 0, item);
    return item;
  }

  splice(start: number, deleteCount?: number | undefined) {
    const deleted = this.values.splice(start, deleteCount);
    this.notify(ArrayObject.Event.REMOVE, start, ...deleted);
    return new ArrayObject(this.id, deleted).succeed(this);
  }

  slice(start?: number, end?: number) {
    const values = this.values.slice(start, end);
    this.notify(ArrayObject.Event.SLICE, start, end, values);
    return new ArrayObject(this.id, values).succeed(this);
  }

  swap(i: number, j: number) {
    const [a, b] = [this.values[i], this.values[j]];
    this.values[i] = b;
    this.values[j] = a;
    this.notify(ArrayObject.Event.SWAP, i, j, a, b);
  }

  compare(i: number, j: number) {
    const res = this.values[i] < this.values[j]
    this.notify(ArrayObject.Event.COMPARE, i, j, res);
    return res
  }
}
export default ArrayObject;
