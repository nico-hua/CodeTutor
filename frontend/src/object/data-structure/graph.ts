import Graph, { GraphNode as IGraphNode } from "../../utils/graph";
import DataStructureObject from "./dataStructure";

export class GraphNode<T> implements IGraphNode<T> {
  private _id: string;
  private _data: T;
  constructor(id: string, data: T) {
    this._id = id
    this._data = data
  } 

  get id() {
    return this._id
  }

  get data() {
    return this._data
  }

  set data(data: T) {
    this._data = data
  }

  copy(): GraphNode<T> {
    return new GraphNode(this.id, this.data)
  }
}

export interface IGraphNodeObject<T> {
  lid: string;
  value: T;
}

export interface IGraphObject<T, Node extends IGraphNodeObject<T>> {
  nodes: Iterable<Node>
  addNode(node: Node): void
  removeNode(node: Node | string): void
  addEdge(node1: string, node2: string, weight: number): void
  removeEdge(node1: string, node2: string): void
  getWeight(node1: string, node2: string): number
  getPredecessors(node: Node | string): Node[]
  getSuccessors(node: Node | string): Node[]
}

export class GraphNodeObject<T> extends DataStructureObject implements IGraphNodeObject<T> {
  private _node: GraphNode<T>;
  private _graph: GraphObject<T>;

  constructor(node: GraphNode<T>, graph: GraphObject<T>) {
    super(graph.globalId(node.id), 'node')
    this._node = node
    this._graph = graph
  }

  get raw() {
    return this._node
  }

  get graph() {
    return this._graph
  }

  get lid() {
    return this.raw.id
  }

  override get value() {
    const value = this._node.data
    this.graph.notify(GraphObject.Event.GET, this.id, value)
    return value
  }

  override set value(value: T) {
    this._node.data = value
    this.graph.notify(GraphObject.Event.UPDATE, this.id, value)
  }

  override copy(id?: string): GraphNodeObject<T> {
    const node = new GraphNode(id ?? this._node.id, this.value)
    return new GraphNodeObject(node, this.graph)
  }
}

export class GraphObject<T> extends DataStructureObject implements IGraphObject<T, GraphNodeObject<T>> {
  static Event = {
    GET: Symbol('get'),
    UPDATE: Symbol('update'),
    ADD_NODE: Symbol('add-node'),
    REMOVE_NODE: Symbol('remove-node'),
    ADD_EDGE: Symbol('add-edge'),
    REMOVE_EDGE: Symbol('remove-edge'),
    GET_SUCCESSORS: Symbol('get-successors'),
    GET_PREDECESSORS: Symbol('get-predecessors'),
  }

  private nodeObjects: Map<string, GraphNodeObject<T>> = new Map();
  nodes: Set<GraphNodeObject<T>> = new Set();

  isGlobalId(id: string) {
    return id.startsWith(this.id)
  }

  globalId(nodeId: string) {
    return `${this.id}#${nodeId}`
  }

  localId(nodeId: string) {
    if (!this.isGlobalId(nodeId)) {
      return nodeId
    }
    return nodeId.substring(this.id.length + 1)
  }
  
  constructor(id: string, private graph: Graph<T, GraphNode<T>> = new Graph<T, GraphNode<T>>()) {
    super(id, 'graph')
    for (const [nodeId, node] of graph.nodes) {
      const nodeObj = new GraphNodeObject(node, this)
      this.nodeObjects.set(this.globalId(nodeId), nodeObj)
      this.nodes.add(nodeObj)
    }
  }

  getNode(id: string) {
    if (!this.isGlobalId(id)) {
      id = this.globalId(id)
    }
    return this.nodeObjects.get(id) || null
  }

  addNode(node: GraphNodeObject<T>) {
    this.nodeObjects.set(node.id, node)
    this.nodes.add(node)
    this.graph.addNode(node.raw)
    this.notify(GraphObject.Event.ADD_NODE, node.id)
  }

  removeNode(node: GraphNodeObject<T> | string) {
    const nodeId = typeof node === 'string' ? node : node.id
    this.nodes.delete(this.nodeObjects.get(nodeId)!)
    this.nodeObjects.delete(nodeId)
    this.graph.removeNode(this.localId(nodeId))
    this.notify(GraphObject.Event.REMOVE_NODE, nodeId)
  }

  addEdge(node1: string, node2: string, weight: number = 0) {
    this.graph.addEdge(this.localId(node1), this.localId(node2), weight)
    this.notify(GraphObject.Event.ADD_EDGE, node1, node2)
  }

  getWeight(node1: string, node2: string) {
    return this.graph.weight(this.localId(node1), this.localId(node2)) || 0
  }

  removeEdge(node1: string, node2: string) {
    this.graph.removeEdge(this.localId(node1), this.localId(node2))
    this.notify(GraphObject.Event.REMOVE_EDGE, node1, node2)
  }

  getPredecessors(nodeOrId: GraphNodeObject<T> | string) {
    const node: GraphNodeObject<T> | null = typeof nodeOrId === 'string' ? this.getNode(nodeOrId) : nodeOrId
    if (node === null) {
      // console.warn(`node not exist: ${nodeOrId}`)
      return []
    }
    const predecessors = Array.from(this.graph.getPredecessors(node.lid)).map(id => this.globalId(id))
    this.notify(GraphObject.Event.GET_PREDECESSORS, node.lid, predecessors)
    return predecessors.map(id => this.nodeObjects.get(id)!)
  }

  getSuccessors(nodeOrId: GraphNodeObject<T> | string) {
    const node: GraphNodeObject<T> | null = typeof nodeOrId === 'string' ? this.getNode(nodeOrId) : nodeOrId
    if (node === null) {
      // console.warn(`node not exist: ${nodeOrId}`)
      return []
    }
    const successors = Array.from(this.graph.getSuccessors(node.lid)).map(id => this.globalId(id))
    this.notify(GraphObject.Event.GET_SUCCESSORS, node.lid, successors)
    return successors.map(id => this.nodeObjects.get(id)!)
  }

  decycle() {
    return new GraphObject(this.id + '-decycle', this.graph.decycle())
  }

  override copy(id?: string): GraphObject<T> {
    return new GraphObject(id ?? this.id, this.graph.subgraph())
  }
}

export default GraphObject