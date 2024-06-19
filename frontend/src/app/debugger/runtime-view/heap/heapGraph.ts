import PriorityQueue from "ts-priority-queue";
import { Position, Slot } from "../../../canvas/ref";
import Graph, { GraphNode } from "../../../../utils/graph";

export class HeapNode implements GraphNode<Slot> {
  private slot: Slot;

  private constructor(slot: Slot, private t: 'src' | 'tgt') {
    this.slot = {
      ...slot,
      id: `${slot.id}`
    }
  }
  
  static src(slot: Slot) {
    return new HeapNode(slot, 'src');
  }

  static tgt(slot: Slot) {
    return new HeapNode(slot, 'tgt');
  }

  get id() {
    return `${this.type}-${this.slot.id}`
  }

  get type() {
    return this.t
  }

  get data() {
    return this.slot;
  }
}

export type TCalcOption = {
  base?: Position,
}

export type TLayoutOption = {
  padding?: number,
  maxWidth?: number,
  rowHeight?: number,
  sorter?: (graph: HeapGraph) => HeapNode[][],
}

const defaultCalcOption: TCalcOption = {
  base: { x: 0, y: 0 },
}

const defaultLayoutOption: TLayoutOption = {
  padding: 20,
  maxWidth: 1000,
  rowHeight: 50,
  sorter: topoSort
}

export default class HeapGraph extends Graph<Slot, HeapNode> {
  private get rectMap() {
    const rectMap = new Map<string, HeapNode[]>()
    for (const [_, node] of this.nodes) {
      if (node.data.rect?.id) {
        const rectId = node.data.rect.id
        if (!rectMap.has(rectId)) {
          rectMap.set(rectId, [])
        }
        rectMap.get(rectId)!.push(node)
      }
    }
    return rectMap
  }

  link() {
    const srcMap = new Map<string, HeapNode[]>()
    const tgtMap = new Map<string, HeapNode[]>()
    
    for (const [_, node] of this.nodes) {
      if (node.type === 'src') {
        if (!srcMap.has(node.data.id)) {
          srcMap.set(node.data.id, [])
        }
        srcMap.get(node.data.id)!.push(node)
      } else {
        if (!tgtMap.has(node.data.id)) {
          tgtMap.set(node.data.id, [])
        }
        tgtMap.get(node.data.id)!.push(node)
      }
    }
    
    for (const [id, srcs] of srcMap) {
      if (srcs.length > 1) {
        console.warn(`Ref with multiple sources: ${id}`)
      }
      const src = srcs[0]
      if (!tgtMap.has(src.data.id)) {
        continue
      }
      for (const tgt of tgtMap.get(src.data.id)!) {
        this.addEdge(src, tgt)
      }
    }
    for (const [_, nodes] of this.rectMap) {
      for (const node1 of nodes) {
        if (node1.type !== 'tgt') continue
        for (const node2 of nodes) {
          if (node1 === node2 || node2.type !== 'src') continue
          this.addEdge(node1, node2)
        }
      }
    }

    return this
  }
  
  calc(options: TCalcOption = {}) {
    options = Object.assign({}, defaultCalcOption, options)
    const { x, y } = options.base!
    const paths = []
    for (const [srcId, tgtIds] of this.edges) {
      const src = this.nodes.get(srcId)!
      const { x: x1, y: y1 } = src.data
      for (const tgtId of tgtIds) {
        const tgt = this.nodes.get(tgtId)!

        if (
          src.data.rect?.id && tgt.data.rect?.id &&
          src.data.rect!.id === tgt.data.rect!.id) {
            continue
        }

        const { x: x2, y: y2 } = tgt.data
        paths.push(`M ${x1 - x} ${y1 - y} L ${x2 - x} ${y2 - y}`)
      }
    }
    return paths
  }

  layout(options: TLayoutOption = {}) {
    options = Object.assign({}, defaultLayoutOption, options)
    const { padding, sorter, maxWidth, rowHeight } = options    
    
    const layout = new Map<string, Position>()
    const curPos = { x: 0, y: 0 }

    // todo
    const rows = sorter!(this)
    for (const row of rows) {
      for (const node of row) {
        if (node.data.rect?.id) {
          const { rect } = node.data
          if (!layout.has(rect.id)) {
            if (curPos.x + padding! + rect.width > maxWidth!) {
              curPos.x = 0
              curPos.y += padding! + rowHeight!
            } 
            layout.set(rect.id, { x: curPos.x,  y: curPos.y })
            curPos.x += padding! + rect.width
          }
        }
      }
      curPos.x = 0
      curPos.y += padding! + rowHeight!
    }
    return layout
  }
}

const TypePriority: Record<string, number> = {
  'REF': 0,
  'DICT': 1,
  'TUPLE': 1,
  'LIST': 1,
  'LITERAL': 2,
  'FUNCTION': 3,
}

function comparator(n1: HeapNode, n2: HeapNode) {
  const t1 = TypePriority[n1.data.rect?.type ?? 'LITERAL']
  const t2 = TypePriority[n2.data.rect?.type ?? 'LITERAL']
  if (t1 !== t2) {
    return t1 - t2
  }
  return n1.id.localeCompare(n2.id)
}

function topoSort(graph: HeapGraph): HeapNode[][] {
  type V = { indeg: number; node: HeapNode }
  // const pq = new PriorityQueue<V>({
  //   comparator: (a, b) => a.indeg === b.indeg ? comparator(a.node, b.node) : a.indeg - b.indeg
  // })

  const indegMap = new Map<string, number>()
  const isNewRow = new Map<string, boolean>()
  const starts = [] 
  for (const [id, node] of graph.nodes) {
    indegMap.set(id, graph.indegree(node))
    if (graph.indegree(node) === 0) {
      isNewRow.set(id, true)
      starts.push(node)
    }
    // pq.queue({ node, indeg: graph.indegree(node) })
  }

  const rows: HeapNode[][] = []
  
  for (const start of starts) {
    const row: HeapNode[] = []
    const pq = new PriorityQueue<V>({
      comparator: (a, b) => a.indeg === b.indeg ? comparator(a.node, b.node) : a.indeg - b.indeg
    })
    pq.queue({ node: start, indeg: indegMap.get(start.id)! })
    while (pq.length > 0) {
      const { node, indeg } = pq.dequeue()!
      
      if (indeg != indegMap.get(node.id)) {
        continue
      }
    
      row.push(node)
    
      for (const tgtId of graph.getSuccessors(node)!) {
        indegMap.set(tgtId, indegMap.get(tgtId)! - 1)
        if (indegMap.get(tgtId) === 0) {
          const tgt = graph.nodes.get(tgtId)! 
          pq.queue({ node: tgt, indeg: indegMap.get(tgtId)! })
        }
      }
    }
    rows.push(row)
  }


  // while (pq.length > 0) {
  //   const { node, indeg } = pq.dequeue()!
    
  //   if (indeg != indegMap.get(node.id)) {
  //     continue
  //   }

  //   if (isNewRow.get(node.id) && row.length > 0) {
  //     rows.push(row.slice())
  //     row.length = 0
  //   }

  //   row.push(node)

  //   for (const tgtId of graph.getSuccessors(node)!) {
  //     indegMap.set(tgtId, indegMap.get(tgtId)! - 1)
  //     const tgt = graph.nodes.get(tgtId)! 
  //     pq.queue({ node: tgt, indeg: indegMap.get(tgtId)! })
  //   }
  // }
  // if (row.length > 0) {
  //   rows.push(row)
  // }

  return rows
}