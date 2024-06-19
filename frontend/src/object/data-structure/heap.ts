import ArrayObject from './array';
import DataStructureObject from './dataStructure';
import { LiteralObject } from './literal';
import { TreeNodeObject, TreeObject } from './tree';

export class HeapObject<T> extends DataStructureObject {
  static Event = {
    GET: Symbol('get'),
    UPDATE: Symbol('update'),
    ADD: Symbol('add'),
    REMOVE: Symbol('remove'),
    SWAP: Symbol('swap'),
    COMPARE: Symbol('compare'),
  };

  data: ArrayObject<T>;
  tree: TreeObject<T>;
  nodeMap: Map<number, TreeNodeObject<T>> = new Map();
  constructor(id: string) {
    super(id, 'heap');
    this.data = new ArrayObject<T>(id + '-data');
    this.tree = new TreeObject<T>(id + '-tree', 2);
  }

  get length() {
    return this.data.length;
  }

  override check(...others: DataStructureObject[]): boolean {
    return others.every(
      (other) => other instanceof ArrayObject || other instanceof LiteralObject
    );
  }

  override accept(...others: DataStructureObject[]): void {
    others.forEach((other) => {
      if (other instanceof ArrayObject) {
        for (const v of other) this.push(v);
      } else if (other instanceof LiteralObject) {
        this.push(other.value);
      }
    });  
  }

  private _parent(index: number) {
    return Math.floor((index - 1) / 2);
  }

  private _heapify(index: number) {
    const l = 2 * (index + 1) - 1;
    const r = 2 * (index + 1);
    let minIndex = index;
    if (l < this.length && this._compare(l, index)) {
      minIndex = l;
    }
    if (r < this.length && this._compare(r, minIndex)) {
      minIndex = r;
    }
    if (minIndex !== index) {
      this._swap(index, minIndex);
      this._heapify(minIndex);
    }
  }

  private _compare(i: number, j: number) {
    const res = this.data.compare(i, j);
    return res;
  }

  private _swap(i: number, j: number) {
    const node1 = this.nodeMap.get(i)!;
    const node2 = this.nodeMap.get(j)!;
    
    this.tree.swap(node1, node2);
    this.data.swap(i, j);
    this.nodeMap.set(i, node2);
    this.nodeMap.set(j, node1);
  }

  uid: number = 0;
  push(value: T) {
    this.data.push(value);
    let index = this.length - 1;

    const node = new TreeNodeObject(String(this.uid++), value, this.tree);
    this.nodeMap.set(index, node);
    this.tree.insert(node, this.nodeMap.get(this._parent(index)) || null);

    while (index > 0) {
      const parent = this._parent(index);
      if (this.data.compare(index, parent)) {
        this._swap(index, parent);

        index = parent;
      } else {
        break;
      }
    }
    this.notify(HeapObject.Event.ADD, value, index);
    return this;
  }

  pop(): T {
    this._swap(0, this.length - 1);
    this.tree.removeNode(this.nodeMap.get(this.length - 1)!);
    this.nodeMap.delete(this.length - 1);
    const value = this.data.pop();
    this._heapify(0);
    this.notify(HeapObject.Event.REMOVE, value);
    return value;
  }

  top(): T {
    return this.data.get(0);
  }

  override begin(): this {
    super.begin()
    this.data.begin();
    this.tree.begin();
    return this;
  }

  override end(): this {
    super.end()
    this.data.end();
    this.tree.end();
    return this;
  }

  override copy(id?: string): HeapObject<T> {
    const heap = new HeapObject<T>(id ?? this.id);
    heap.data = this.data.copy(heap.id + '-data');
    heap.tree = this.tree.copy(heap.id + '-tree');
    for (const [index, node] of this.nodeMap) {
      heap.nodeMap.set(index, heap.tree.getNode(node.lid)!);
    }
    return heap;
  }
}
