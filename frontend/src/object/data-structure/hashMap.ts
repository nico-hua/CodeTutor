import ArrayObject from "./array";
import DataStructureObject from "./dataStructure";
import { LinkListNodeObject, LinkListObject } from "./linkList";
import { RefObject } from "./ref";

export class HashMapObject<K, V> extends DataStructureObject {
  static Event = {
    GET: Symbol('get'),
    UPDATE: Symbol('update'),
  }

  slots: ArrayObject<RefObject<LinkListObject<V>>>;
  lid2key: Map<string, K> = new Map()
  constructor(id: string, private size: number, private hash: (k: K) => number, map: Map<K, V> = new Map()) {
    super(id, 'hashmap')
    this.slots = new ArrayObject<RefObject<LinkListObject<V>>>(id + '-slots')
    for (let i = 0; i < size; i++) {
      const list = new LinkListObject<V>(`${id}-slot${i}`)
      this.slots.push(new RefObject(list.id, list))
    }
    map.forEach((value, key) => this.set(key, value))
  }

  override begin(): this {
    super.begin()
    for (let i = 0; i < this.size; i++) {
      this.slots.get(i).value.begin()
    }
    return this
  }

  override end(): this {
    super.end()
    for (let i = 0; i < this.size; i++) {
      this.slots.get(i).value.end()
    }
    return this
  }

  private find(key: K) {
    const i = this.hash(key) % this.size
    const list = this.slots.get(i).value
    let node: LinkListNodeObject<V> | null = list.head.next as LinkListNodeObject<V>
    while (node) {
      if (node.lid === String(key)) {
        return node
      }
      node = node.next
    }
    return null
  }

  get(key: K): V | null {
    const node = this.find(key)
    const value = node ? node.value : null
    this.notify(HashMapObject.Event.GET, key, value)
    return value
  }

  set(key: K, value: V) {
    let oldValue: V | null = null
    const node = this.find(key)
    if (node) {
      oldValue = node.value
      node.value = value
    } else {
      const i = this.hash(key) % this.size
      const list = this.slots.get(i).value
      this.lid2key.set(String(key), key)
      list.insert(new LinkListNodeObject(String(key), value, list))
    }
    this.notify(HashMapObject.Event.UPDATE, key, value, oldValue)
    return this
  }

  delete(key: K) {
    const node = this.find(key)
    if (node) {
      const i = this.hash(key) % this.size
      const list = this.slots.get(i).value
      list.remove(node)
      return true
    }
    return false
  }

  *[Symbol.iterator](): Generator<[K, V]> {
    for (let i = 0; i < this.size; i++) {
      const list = this.slots.get(i).value
      let node: LinkListNodeObject<V> | null = list.head.next as LinkListNodeObject<V>
      while (node) {
        yield [this.lid2key.get(node.lid)!, node.value]
        node = node.next
      }
    }
  }

  keys() {
    const keys = []
    for (const [key, _] of this) {
      keys.push(key)
    }
    return keys
  }

  override copy(id?: string): HashMapObject<K, V> {
    const map = new HashMapObject<K, V>(id || this.id, this.size, this.hash)
    for (const [key, value] of this) {
      map.set(key, value)
    }
    return map
  }
}

export function strHash(key: string) {
  let h = 5381;
  for (let i = 0; i < key.length; i++) {
      h = ((h << 5) + h) + key.charCodeAt(i);
  }
  return h >>> 0;
}

export default HashMapObject