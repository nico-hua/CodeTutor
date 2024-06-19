import ArrayObject from "./array"
import DataStructureObject from "./dataStructure"
import { LiteralObject } from "./literal"

export class QueueObject<T> extends DataStructureObject {
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
    super(id, 'queue')
  }

  override copy(id?: string): QueueObject<T> {
    if (id === undefined) {
      id = this.id
    }
    return new QueueObject(id, this.values.slice())
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
    this.notify(QueueObject.Event.GET, index, value);
    return value
  }

  set(index: number, value: T): void {
    const oldValue = this.values[index];
    this.values[index] = value;
    this.notify(QueueObject.Event.UPDATE, index, value, oldValue);
  }
  
  push(...items: T[]) {
    const length = this.values.length
    this.values.push(...items)
    this.notify(QueueObject.Event.ADD, length, ...items)
    return this.values.length
  }
  
  unshift(...items: T[]) {
    this.values.unshift(...items)
    this.notify(QueueObject.Event.ADD, 0, ...items)
    return this.values.length
  }
  
  pop() {
    const item = this.values.pop()
    this.notify(QueueObject.Event.REMOVE, this.values.length, item)
    return item
  }
  
  shift() {
    const item = this.values.shift()
    this.notify(QueueObject.Event.REMOVE, 0, item)
    return item
  }

  splice(start: number, deleteCount?: number | undefined) {
    const deleted = this.values.splice(start, deleteCount)
    this.notify(QueueObject.Event.REMOVE, start, ...deleted)
    return new QueueObject(this.id, deleted).succeed(this)
  }

  slice(start?: number, end?: number) {
    const values = this.values.slice(start, end)
    this.notify(QueueObject.Event.SLICE, start, end, values)
    return new QueueObject(this.id, values).succeed(this)
  }

  swap(i: number, j: number) {
    const [a, b] = [this.values[i], this.values[j]]
    this.values[i] = b
    this.values[j] = a
    this.notify(QueueObject.Event.SWAP, i, j, a, b)
  }
}
export default QueueObject;
