import DataStructureObject from "./dataStructure";
import GraphObject, { GraphNode, GraphNodeObject, IGraphNodeObject, IGraphObject } from "./graph";

export class TreeNodeObject<T> extends DataStructureObject implements IGraphNodeObject<T> {
  private _node: GraphNodeObject<T>;
  private _lid: string;
  constructor(id: string, value: T, private tree: TreeObject<T>) {
    super(tree.graph.globalId(id), 'tree-node')
    this._lid = id
    this._node = new GraphNodeObject<T>(new GraphNode<T>(id, value), tree.graph)
    tree.nodeTransMap.set(this._node, this)
  }

  get node() {
    return this._node
  }

  get _value() {
    return this._node.value
  }

  override get value() {
    this.tree.notify(TreeObject.Event.GET, this, this._node.value)
    return this._node.value
  }

  override set value(value: T) {
    this.tree.notify(TreeObject.Event.UPDATE, this, value, this._node.value)
    this._node.value = value
  }

  get lid() {
    return this._lid
  }

  get parent() {
    const predecessors = this.tree.getPredecessors(this)
    if (predecessors.length > 1) {
      console.warn(`${this.lid} has more than one predecessors`)
    }
    return predecessors[0] || null
  }

  set parent(parent: TreeNodeObject<T> | null) {
    if (this.parent) {
      this.tree.graph.removeEdge(this.parent.lid, this.lid)
    } else if (this === this.tree.root) {
      this.tree.root = parent
    } else {
      console.warn(`${this.lid} has no predecessors but not the root`)
    }
    if (parent) {
      this.tree.graph.addEdge(parent.lid, this.lid)
    }
  }

  get children() {
    return this.tree.getSuccessors(this)
  }
}

export class TreeObject<T> extends DataStructureObject implements IGraphObject<T, TreeNodeObject<T>> {
  static Event = {
    GET: Symbol('get'),
    UPDATE: Symbol('update'),
    ADD: Symbol('add'),
    REMOVE: Symbol('remove'),
    COMPARE: Symbol('compare'),
    SWAP: Symbol('swap'),
  }

  root: TreeNodeObject<T> | null = null
  graph: GraphObject<T>
  nodeTransMap: WeakMap<GraphNodeObject<T>, TreeNodeObject<T>> = new WeakMap();
  branch!: (node: TreeNodeObject<any>) => number
  constructor(id: string, branch: ((node: TreeNodeObject<any>) => number) | number) {
    super(id, 'tree');
    this.graph = new GraphObject(id + '-data');
    this.setBranch(branch);
  }

  get nodes() {
    return Array.from(this.graph.nodes).map(node => this.nodeTransMap.get(node)!);
  }

  getNode(id: string): TreeNodeObject<T> {
    return this.nodeTransMap.get(this.graph.getNode(id)!)!;
  }

  addNode(node: TreeNodeObject<T>): void {
    this.insert(node)
  }

  removeNode(node: string | TreeNodeObject<T>): void {
    node = typeof node === 'string' ? this.nodeTransMap.get(this.graph.getNode(node)!)! : node;
    this.graph.removeNode(node.id)
  }

  addEdge(node1: string, node2: string, weight: number): void {
    throw new Error("Method not implemented.");
  }

  removeEdge(node1: string, node2: string): void {
    throw new Error("Method not implemented.");
  }

  getWeight(node1: string, node2: string): number {
    return this.graph.getWeight(node1, node2);
  }

  getPredecessors(node: string | TreeNodeObject<T>): TreeNodeObject<T>[] {
    node = typeof node === 'string' ? this.nodeTransMap.get(this.graph.getNode(node)!)! : node;
    return this.graph.getPredecessors(node.id).map(node => this.nodeTransMap.get(node)!);
  }

  getSuccessors(node: string | TreeNodeObject<T>): TreeNodeObject<T>[] {
    node = typeof node === 'string' ? this.nodeTransMap.get(this.graph.getNode(node)!)! : node;
    return this.graph.getSuccessors(node.id).map(node => this.nodeTransMap.get(node)!);
  }

  setBranch(branch: ((node: TreeNodeObject<any>) => number) | number, force = false) {
    const br = typeof branch === 'number' ? (node: TreeNodeObject<any>) => branch : branch;
    
    for (let node of this.nodes.slice()) {
      if (this.graph.getNode(node.id) === null) continue
      const children = node.children.slice();
      if (br(node) < children.length) {
        if (force) {
          for (let i = br(node); i < children.length; i++) {
            this.remove(children[i])
          }
        } else {
          return false
        }
      }
    }
    this.branch = br;
    return true
  }

  insert(node: TreeNodeObject<T>, parent: TreeNodeObject<T> | null = null) {
    parent = parent || this.root
    if (!parent) {
      this.graph.addNode(node.node)
      this.root = node
    } else {
      if (parent.children.length < this.branch(parent)) {
        this.graph.addNode(node.node)
        this.graph.addEdge(parent.id, node.id)
      } else {
        console.warn('branch overflow', parent)
        return
      }
    }
    this.notify(TreeObject.Event.ADD, node, parent)
  }

  remove(node: TreeNodeObject<T>) {
    const parent = node.parent
    this.removeNode(node.id)
    this.notify(TreeObject.Event.REMOVE, node, parent)
  }

  compare(node1: TreeNodeObject<T>, node2: TreeNodeObject<T>) {
    const res = node1._value < node2._value
    this.notify(TreeObject.Event.COMPARE, node1, node2, res)
    return res
  }

  swap(node1: TreeNodeObject<T>, node2: TreeNodeObject<T>) {
    if (node2.parent === node1) {
      node2.parent = node1.parent;
      node1.parent = node2;
    } else if (node1.parent === node2) {
      this.swap(node2, node1);
      return;
    } else {
      const parent = node1.parent;
      node2.parent = parent;
      node1.parent = node2;
    }

    const children1 = node1.children.slice();
    const children2 = node2.children.slice();
    children1.forEach((child) => {
      if (child !== node2) child.parent = node2;
    });
    children2.forEach((child) => {
      if (child !== node1) child.parent = node1;
    });
    this.notify(TreeObject.Event.SWAP, node1, node2)
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

  override copy(id?: string): TreeObject<T> {
    const tree = new TreeObject<T>(id || this.id, this.branch)
    const copy = (node: TreeNodeObject<T>, parent: TreeNodeObject<T> | null = null) => {
      const newNode = new TreeNodeObject<T>(node.lid, node.value, tree)
      tree.insert(newNode, parent)
      for (let child of node.children) {
        copy(child, newNode)
      }
    }
    if (this.root) {
      copy(this.root)
    }
    return tree
  }
}