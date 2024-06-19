import PriorityQueue from "ts-priority-queue";
import Graph, { GraphNode } from "../../utils/graph"
import { Position, Rect, Slot, Slots } from "./ref";
import CanvasLayout from "./canvasLayout";

export class CanvasNode implements GraphNode<Slot> {
  constructor(private rect: Rect) {}
  
  static padding() {
    return new CanvasNode({
      id: '#PADDING', type: '#PADDING',
      x: 0, y: 0, width: 0, height: 0,
    });
  }

  get id() {
    return `${this.rect.id}`
  }

  get data() {
    return this.rect;
  }

  copy(): CanvasNode {
    return new CanvasNode({ ...this.rect });
  }
}

export type TCalcOption = {
  base?: Position,
}

type TGridCell = {
  node: CanvasNode;
  row: number;
  col: number;
}
export type TGridLayout = TGridCell[]

export type TLayoutOption = {
  padding?: number,
  maxWidth?: number,
  minRowHeight?: number,
  minColumnWidth?: number,
  base?: Position,
  sorter?: (graph: CanvasGraph) => TGridLayout,
}

const defaultCalcOption: TCalcOption = {
  base: { x: 0, y: 0 },
}

const defaultLayoutOption: TLayoutOption = {
  padding: 36,
  maxWidth: 1080,
  minRowHeight: 100,
  minColumnWidth: 100,
  base: { x: 0, y: 0 },
  sorter: topoSort
}

export default class CanvasGraph extends Graph<Slot, CanvasNode> {
  private rectMap: Map<string, { rect: Rect, inputs: Set<Slot>, outputs: Set<Slot> }> = new Map();
  private slot2rect: { inputs: Map<string, string>, outputs: Map<string, Set<string>> } = { inputs: new Map(), outputs: new Map() }; 
  constructor(slots: Slots) {
    super()
    for (const slot of slots.inputs) {
      let { id, x, y, rect } = slot
      if (!rect) {
        rect = {
          id: `#POINT-${id}`,
          type: '#POINT',
          x, y, width: 0, height: 0,
        }
      }
      rect = { ...rect }
      if (!this.rectMap.has(rect.id)) {
        this.rectMap.set(rect.id, { rect, inputs: new Set(), outputs: new Set() })
      }
      this.rectMap.get(rect.id)!.inputs.add(slot)
      const map = this.slot2rect.inputs
      if (map.has(id)) {
        console.warn(`duplicate input slot id: ${id}`)
      }
      map.set(id, rect.id)
    }
    for (const slot of slots.outputs) {
      let { id, x, y, rect } = slot
      if (!rect) {
        rect = {
          id: `#POINT-${id}`,
          type: '#POINT',
          x, y, width: 0, height: 0,
        }
      }
      rect = { ...rect }
      if (!this.rectMap.has(rect.id)) {
        this.rectMap.set(rect.id, { rect, inputs: new Set(), outputs: new Set() })
      }
      this.rectMap.get(rect.id)!.outputs.add(slot)
      const map = this.slot2rect.outputs
      if (!map.has(id)) {
        map.set(id, new Set())
      }
      map.get(id)!.add(rect.id)
    }
    for (const { rect } of this.rectMap.values()) {
      this.addNode(new CanvasNode(rect))
    }
  }
  
  link() {
    for (const { rect, outputs } of this.rectMap.values()) {
      for (const { id } of outputs) {
        const tgt = this.slot2rect.inputs.get(id)
        if (tgt) this.addEdge(rect.id, tgt)
      }
    }
    return this
  }
  
  calc(options: TCalcOption = {}) {
    options = Object.assign({}, defaultCalcOption, options)
    const { x, y } = options.base!
    const paths = []
    for (const [srcId, tgtIds] of this.edges) {
      for (const { id: id1, x: x1, y: y1 } of this.rectMap.get(srcId)!.outputs) {
        for (const tgtId of tgtIds) {
          for (const { id: id2, x: x2, y: y2 } of this.rectMap.get(tgtId)!.inputs) {
            if (id1 !== id2) continue
            paths.push(`M${x1 - x},${y1 - y} Q${x1 - x},${y2 - y} ${x2 - x},${y2 - y}`)
          }
        }
      }
    }
    return paths
  }

  layout(options: TLayoutOption = {}): CanvasLayout {
    options = Object.assign({}, defaultLayoutOption, options)
    const { padding, sorter, maxWidth, minRowHeight, minColumnWidth, base } = options    
    const curPos = { ...base! }

    const layout = new Map<string, Position>()

    const gridLayout = sorter!(this)
    const rows: TGridCell[][] = []
    for (const cell of gridLayout) {
      const { row } = cell
      while (rows.length <= row) {
        rows.push([])
      }
      rows[row].push(cell)
    }
    for (const row of rows) {
      const cols: TGridCell[][] = []
      let colMaxlen = 0
      for (const cell of row) {
        const { col } = cell
        while (cols.length <= col) {
          cols.push([])
        }
        cols[col].push(cell)
        colMaxlen = Math.max(colMaxlen, cols[col].length)
      }
      const paddingCell = { 
        node: new CanvasNode({ id: '#PADDING', type: '#PADDING', x: 0, y: 0, width: 0, height: 0 }),
        row: 0, col: 0
      }
      for (let i = 0; i < cols.length; i++) {
        cols[i] = pad(cols[i], colMaxlen, paddingCell, 'center')
      }
      let rowHeight = minRowHeight!
      let colWidth = minColumnWidth!
      const newRow = () => {
        curPos.x = base!.x
        curPos.y += padding! + rowHeight!
        rowHeight = minRowHeight!
        colWidth = minColumnWidth!
      }
      for (let r = 0; r < colMaxlen; r++) {
        for (const col of cols) {
          const { node: { data: { id, width, height } } } = col[r]
          colWidth = Math.max(colWidth, width)
          rowHeight = Math.max(rowHeight, height)
          
          if (curPos.x + padding! + colWidth > maxWidth!) {
            console.warn(`layout overflow: ${curPos.x + colWidth}(max: ${maxWidth})`)
            newRow()
          }
          if (id !== '#PADDING') {
            layout.set(id, { ...curPos })
          }
          curPos.x += padding! + colWidth
        }
        newRow()
      }
    }
    return new CanvasLayout(layout)
  }
}

export function buildGraph(slots: Slots) {
  return new CanvasGraph(slots)
}

const TypePriority: Record<string, number> = {
  'REF': 0,
  'DICT': 1,
  'TUPLE': 1,
  'LIST': 1,
  'LITERAL': 2,
  'FUNCTION': 3,
}

function comparator(n1: CanvasNode, n2: CanvasNode) {
  const t1 = TypePriority?.[n1.data.type] || 0
  const t2 = TypePriority?.[n2.data.type] || 0
  if (t1 !== t2) {
    return t1 - t2
  }
  return n1.id.localeCompare(n2.id)
}

export function topoSort(graph: CanvasGraph): TGridCell[] {
  type V = { indeg: number; node: CanvasNode }

  graph = graph.deselflink().decycle() as CanvasGraph

  const indegMap = new Map<string, number>()
  const columnMap = new Map<string, number>()
  const isVisit = new Map<string, boolean>()
  const starts = []
  for (const [id, node] of graph.nodes) {
    indegMap.set(id, graph.indegree(node))
    if (graph.indegree(node) === 0) {
      columnMap.set(id, 0)
      starts.push(node)
    }
  }

  const grid: TGridCell[] = []
  let row = -1
  for (const start of starts) {
    const pq = new PriorityQueue<V>({
      comparator: (a, b) => a.indeg === b.indeg ? comparator(a.node, b.node) : a.indeg - b.indeg
    })
    pq.queue({ node: start, indeg: indegMap.get(start.id)! })
    while (pq.length > 0) {
      const { node, indeg } = pq.dequeue()!
      
      if (indeg != indegMap.get(node.id)) {
        continue
      }
    
      isVisit.set(node.id, true)
      const col = columnMap.get(node.id)!
      if (col === 0) row++
      grid.push({ node, row, col })

      for (const tgtId of graph.getSuccessors(node)!) {
        indegMap.set(tgtId, indegMap.get(tgtId)! - 1)
        columnMap.set(tgtId, Math.max(columnMap.get(tgtId) || 0, col + 1))
        if (indegMap.get(tgtId) === 0) {
          const tgt = graph.nodes.get(tgtId)! 
          pq.queue({ node: tgt, indeg: indegMap.get(tgtId)! })
        }
      }
    }
    
  }
  for (const [id, _] of graph.nodes) {
    if (!isVisit.get(id)) {
      console.warn('do not visit: ', id)
    }
  }
  return grid
}

export function treeSort(graph: CanvasGraph): TGridCell[] {
  let root: CanvasNode | undefined
  for (const [_, node] of graph.nodes) {
    if (graph.indegree(node) === 0) {
      root = node
      break
    }
  }
  if (!root) {
    return []
  }

  const layout = (node: CanvasNode): { grid: TGridCell[], col: number, row: number } => {
    let col = 0
    let row = 0

    const grid: TGridCell[] = []
    graph.getSuccessors(node).forEach(child => {
      const { row: r, col: c, grid: g } = layout(graph.nodes.get(child)!)
      
      g.forEach(({ row: r0, col: c0, node }) => {
        grid.push({ row: r0 + row, col: c0 + 1, node })
      })
      col = Math.max(c, col)
      row += r
    })
    col++
    row = Math.max(row, 1)
    grid.push({ node, row: Math.floor((row - 1) / 2), col: 0 })
    return { grid, col, row }
  }

  return layout(root).grid
}

function pad<T>(
  arr: T[], 
  len: number,
  padding: T, 
  align: 'center' | 'left' | 'right' = 'center'): T[]
{
  if (arr.length >= len) {
    return arr
  }
  const paddingLen = len - arr.length
  const paddingArr = new Array(paddingLen).fill(padding)
  switch (align) {
    case 'left':
      return [...arr, ...paddingArr]
    case 'right':
      return [...paddingArr, ...arr]
    case 'center':
      const paddingLenEach = Math.floor(paddingLen / (arr.length + 1))
      const paddedArr: T[] = []
      for (let i = 0; i < arr.length; i++) {
        const len = paddingLenEach + (i < paddingLen - paddingLenEach * (arr.length + 1)? 1 : 0)
        paddedArr.push(...new Array(len).fill(padding), arr[i])
      }
      paddedArr.push(...new Array(paddingLenEach).fill(padding))
      if (paddedArr.length < len) {
        console.error('pad error: ', arr, len, padding, align)
      }
      return paddedArr
    default:
      return arr
  }
}