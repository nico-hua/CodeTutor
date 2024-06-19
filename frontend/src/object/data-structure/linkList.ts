import ArrayObject from "./array";
import DataStructureObject from "./dataStructure";
import GraphObject, { GraphNode, GraphNodeObject } from "./graph";
import { LiteralObject } from "./literal";

export class LinkListNodeObject<T> extends DataStructureObject {
  private _node: GraphNodeObject<T>;
  private _lid: string;
  constructor(id: string, value: T, private list: LinkListObject<T>) {
    super(list.graph.globalId(id), 'linklist-node')
    this._lid = id
    this._node = new GraphNodeObject<T>(new GraphNode<T>(id, value), list.graph)
    list.graph.addNode(this._node)
    list.nodeTransMap.set(this._node, this)
  }

  get node() {
    return this._node
  }

  get lid() {
    return this._lid
  }

  get gid() {
    return this.list.graph.globalId(this.lid)
  }

  get next(): LinkListNodeObject<T> | null {
    const successors = Array.from(this.list.graph.getSuccessors(this.node))
    const next = successors.length > 0 ? this.list.t(successors[0])! : null
    this.notify(LinkListObject.Event.GET_NEXT, this, next)
    return next
  }

  set next(node: LinkListNodeObject<T> | null) {
    if (this.next) {
      this.list.graph.removeEdge(this.gid, this.next.gid)
    }
    if (node) {
      this.list.graph.addEdge(this.gid, node.gid)
    }
    this.notify(LinkListObject.Event.SET_NEXT, this, node)
  }

  get prev(): LinkListNodeObject<T> | null {
    const predecessors = Array.from(this.list.graph.getPredecessors(this.node))
    const prev = predecessors.length > 0 ? this.list.t(predecessors[0])! : null
    this.notify(LinkListObject.Event.GET_PREV, this, prev)
    return prev
  }

  set prev(node: LinkListNodeObject<T> | null) {
    if (this.prev) {
      this.list.graph.removeEdge(this.prev.gid, this.gid)
    }
    if (node) {
      this.list.graph.addEdge(node.gid, this.gid)
    }
    this.notify(LinkListObject.Event.SET_PREV, this, node)
  }

  override get value(): T {
    this.list.notify(LinkListObject.Event.GET, this, this._node.value)
    return this._node.value
  }

  override set value(value: T) {
    this.list.notify(LinkListObject.Event.UPDATE, this, value)
    this._node.value = value
  }
}

export class LinkListObject<T> extends DataStructureObject {
  static Event = {
    GET: Symbol('get'),
    UPDATE: Symbol('update'),
    ADD: Symbol('add'),
    REMOVE: Symbol('remove'),
    GET_NEXT: Symbol('get next'),
    SET_NEXT: Symbol('set next'),
    GET_PREV: Symbol('get prev'),
    SET_PREV: Symbol('set prev'),
  }
  
  graph: GraphObject<T>;
  nodeTransMap: Map<GraphNodeObject<T>, LinkListNodeObject<T>> = new Map();
  head: LinkListNodeObject<unknown>;
  constructor(id: string, values: T[] = []) {
    super(id, 'linklist')
    this.graph = new GraphObject(id + '-data');
    this.head = new LinkListNodeObject('head', null, this);

    values.forEach(value => this.insert(new LinkListNodeObject(`init${this.length}`, value, this)))
  }

  get length() {
    return this.graph.nodes.size
  }

  override check(...others: DataStructureObject[]): boolean {
    return others.every(
      (other) => other instanceof ArrayObject || other instanceof LiteralObject
    );
  }

  override accept(...others: DataStructureObject[]): void {
    others.forEach((other) => {
      if (other instanceof ArrayObject) {
        for (const v of other) this.insert(new LinkListNodeObject(String(this.length), v, this));
      } else if (other instanceof LiteralObject) {
        this.insert(new LinkListNodeObject(String(this.length), other.value, this));
      }
    });  
  }

  t(node: GraphNodeObject<T>) {
    return this.nodeTransMap.get(node)
  }

  insert(node: LinkListNodeObject<T>, anchor: LinkListNodeObject<T> | null = null) {
    anchor = anchor || this.head as LinkListNodeObject<T>
    if (anchor.next) {
      node.next = anchor.next
      anchor.next.prev = node
    } else {
      node.next = null
    }
    anchor.next = node
    node.prev = anchor
    this.notify(LinkListObject.Event.ADD, node, anchor)
  }

  remove(node: LinkListNodeObject<T>) {
    if (!node.prev) {
      console.warn(`node ${node.id} is not in list ${this.id}`)
      return
    }
    node.prev.next = node.next
    if (node.next) {
      node.next.prev = node.prev
    }
    node.prev = node.next = null
    this.graph.removeNode(node.id)
    this.notify(LinkListObject.Event.REMOVE, node)
  }

  override begin(): this {
    super.begin()
    this.graph.begin()
    return this
  }

  override end(): this {
    super.end()
    this.graph.end()
    return this
  }

  override copy(id?: string): LinkListObject<T> {
    const list = new LinkListObject<T>(id || this.id)
    let prev: LinkListNodeObject<T> | null = this.head as LinkListNodeObject<T>
    let node: LinkListNodeObject<T> | null = this.head.next as LinkListNodeObject<T>
    while (node) {
      list.insert(new LinkListNodeObject(node.lid, node.value, list), prev)
      prev = node
      node = node.next
    }
    return list
  }
}