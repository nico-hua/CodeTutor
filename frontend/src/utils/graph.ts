import PriorityQueue from "ts-priority-queue";

export interface GraphNode<T> {
  id: string;
  data: T;
}

export default class Graph<T, Node extends GraphNode<T> = GraphNode<T>> {
  private nodeMap: Map<string, Node>;
  private weightMap: Map<string, Map<string, number>>;

  private predecessors: Map<string, Set<string>>;
  private successors: Map<string, Set<string>>;

  constructor() {
    this.nodeMap = new Map();
    this.weightMap = new Map();
    this.predecessors = new Map();
    this.successors = new Map();
  }

  get nodes() {
    return this.nodeMap;
  }

  getPredecessors(node: GraphNode<T> | string) {
    if (typeof node === 'string') {
      node = this.nodeMap.get(node)!; 
    }
    return this.predecessors.get(node.id)!;
  }

  getSuccessors(node: GraphNode<T> | string) {
    if (typeof node === 'string') {
      node = this.nodeMap.get(node)!; 
    }
    return this.successors.get(node.id)!;
  }

  get edges() {
    const edges = new Map<string, Set<string>>();
    for (const [nodeId, successors] of this.successors) {
      for (const successor of successors) {
        if (!edges.has(nodeId)) {
          edges.set(nodeId, new Set());
        }
        edges.get(nodeId)!.add(successor);
      }
    }
    return edges;
  }

  indegree(node: GraphNode<T> | string) {
    return this.getPredecessors(node).size ?? 0;
  }

  outdegree(node: GraphNode<T> | string) {
    return this.getSuccessors(node).size ?? 0;
  }

  weight(id1: string, id2: string) {
    if (this.nodeMap.has(id1) && this.nodeMap.has(id2)) {
      return this.weightMap.get(id1)?.get(id2) || 0;
    }
    return null
  }

  addNode(node: Node) {
    if (this.nodeMap.has(node.id)) {
      console.warn(`Node will be overwitten: ${node.id}`)
      return
    }
    this.nodeMap.set(node.id, node);
    this.successors.set(node.id, new Set());
    this.predecessors.set(node.id, new Set());
  }

  removeNode(node: GraphNode<T> | string) {
    const nodeId = typeof node === 'string' ? node : node.id;
    if (!this.nodeMap.has(nodeId)) {
      console.warn(`Node not found: ${nodeId}`);
    } else {
      const node = this.nodeMap.get(nodeId)!;
      for (const successor of this.getSuccessors(node)) {
        this.predecessors.get(successor)!.delete(nodeId);
      }
      for (const predecessor of this.getPredecessors(node)) {
        this.successors.get(predecessor)!.delete(nodeId);
      }
    }
  }

  addEdge(node1: Node | string, node2: Node | string, weight: number = 0) {
    if (typeof node1 === 'string') {
      node1 = this.nodeMap.get(node1)!; 
    }
    if (typeof node2 === 'string') {
      node2 = this.nodeMap.get(node2)!; 
    }
    if (!node1 || !node2) {
      console.warn(`Node not found: ${node1} ${node2}`);
      return;
    }
    
    if (!this.nodeMap.has(node1.id)) {
      this.addNode(node1);
    }
    if (!this.nodeMap.has(node2.id)) {
      this.addNode(node2);
    }
    if (!this.weightMap.has(node1.id)) {
      this.weightMap.set(node1.id, new Map());
    }
    this.weightMap.get(node1.id)!.set(node2.id, weight);
    this.successors.get(node1.id)!.add(node2.id);
    this.predecessors.get(node2.id)!.add(node1.id);
  }

  removeEdge(node1: GraphNode<T> | string, node2: GraphNode<T> | string) {
    const nodeId1 = typeof node1 === 'string' ? node1 : node1.id;
    const nodeId2 = typeof node2 === 'string' ? node2 : node2.id;
    if (!this.nodeMap.has(nodeId1) || !this.nodeMap.has(nodeId2)) {
      console.warn(`Node not found: ${nodeId1} ${nodeId2}`);
      return;
    }
    this.weightMap.get(nodeId1)?.delete(nodeId2);
    this.successors.get(nodeId1)!.delete(nodeId2);
    this.predecessors.get(nodeId2)!.delete(nodeId1);
  }

  subgraph(nodes?: Node[] | string[]): Graph<T, Node> {
    const subgraph = new Graph<T, Node>();
    if (!nodes) {
      nodes = Array.from(this.nodeMap.values());
    }
    for (let node of nodes) {
      if (typeof node === 'string') {
        node = this.nodeMap.get(node)!; 
      }
      node = { id: node.id, data: node.data } as Node
      subgraph.addNode(node);
      for (const successor of this.getSuccessors(node)) {
        if (subgraph.nodeMap.has(successor)) {
          subgraph.addEdge(node, this.nodeMap.get(successor)!, this.weight(node.id, successor)!);
        }
      }
      for (const predecessor of this.getPredecessors(node)) {
        if (subgraph.nodeMap.has(predecessor)) {
          subgraph.addEdge(this.nodeMap.get(predecessor)!, node, this.weight(predecessor, node.id)!);
        }
      }
    }
    return subgraph;
  }

  deselflink() {
    const g = this.subgraph()
    for (const [id, _] of g.nodes) {
      g.removeEdge(id, id)
    }    
    return g
  }

  decycle() {
    const g = this.subgraph()
    
    type V = { indeg: number; node: GraphNode<T> }
    const pq = new PriorityQueue<V>({
      comparator: (a, b) => a.indeg - b.indeg
    })
    const indegMap = new Map<string, number>()
    for (const [id, node] of g.nodes) {
      indegMap.set(id, g.indegree(node))
      pq.queue({ node, indeg: indegMap.get(id)! })
    }
    while (pq.length > 0) {
      const { node, indeg } = pq.dequeue()!
      
      if (indeg != indegMap.get(node.id)) {
        continue
      }
  
      if (indeg > 0) {
        for (const pred of g.getPredecessors(node)!) {
          g.removeEdge(pred, node)
        }
        indegMap.set(node.id, 0)
      }
    
      for (const succ of g.getSuccessors(node)!) {
        indegMap.set(succ, indegMap.get(succ)! - 1)
        pq.queue({ node: g.nodes.get(succ)!, indeg: indegMap.get(succ)! })
      }
    }
  
    return g
  }
}