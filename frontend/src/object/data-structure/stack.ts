import ArrayObject from "./array"
import DataStructureObject from "./dataStructure"
import { LiteralObject } from "./literal"

export class StackObject<T> extends DataStructureObject {
  [index: number]: T

  static Event = {
    GET: Symbol('get'),
    UPDATE: Symbol('update'),
    ADD: Symbol('add'),
    REMOVE: Symbol('remove'),
    SWAP: Symbol('swap'),
    SLICE: Symbol('slice'),
  }

  constructor(id: string, private values: Array<any> = []) {
    super(id, 'stack')
  }

  override copy(id?: string): StackObject<T> {
    if (id === undefined) {
      id = this.id
    }
    return new StackObject(id, this.values.slice())
  }

  get length() {
    return this.values.length
  }

  [Symbol.iterator]() {
    return this.values.values()
  }

  override check(...others: DataStructureObject[]): boolean {
    return others.every(
      (other) => other instanceof ArrayObject || other instanceof LiteralObject
    );
  }

  override accept(...others: DataStructureObject[]): void {
    others.forEach((other) => {
      if (other instanceof ArrayObject) {
        this.values.push(...other);
      } else if (other instanceof LiteralObject) {
        this.values.push(other.value);
      }
    });  
  }

  get(index: number) {
    const value = this.values[index];
    this.notify(StackObject.Event.GET, index, value);
    return value
  }

  set(index: number, value: T): void {
    const oldValue = this.values[index];
    this.values[index] = value;
    this.notify(StackObject.Event.UPDATE, index, value, oldValue);
  }
  
  push(...items: T[]) {
    const length = this.values.length
    this.values.push(...items)
    this.notify(StackObject.Event.ADD, length, ...items)
    return this.values.length
  }
  
  unshift(...items: T[]) {
    this.values.unshift(...items)
    this.notify(StackObject.Event.ADD, 0, ...items)
    return this.values.length
  }
  
  pop() {
    const item = this.values.pop()
    this.notify(StackObject.Event.REMOVE, this.values.length, item)
    return item
  }
  
  shift() {
    const item = this.values.shift()
    this.notify(StackObject.Event.REMOVE, 0, item)
    return item
  }

  splice(start: number, deleteCount?: number | undefined) {
    const deleted = this.values.splice(start, deleteCount)
    this.notify(StackObject.Event.REMOVE, start, ...deleted)
    return new StackObject(this.id, deleted).succeed(this)
  }

  slice(start?: number, end?: number) {
    const values = this.values.slice(start, end)
    this.notify(StackObject.Event.SLICE, start, end, values)
    return new StackObject(this.id, values).succeed(this)
  }

  swap(i: number, j: number) {
    const [a, b] = [this.values[i], this.values[j]]
    this.values[i] = b
    this.values[j] = a
    this.notify(StackObject.Event.SWAP, i, j, a, b)
  }
}
export default StackObject;
