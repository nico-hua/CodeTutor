import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TDragEndEvent, TDragEnterEvent, TDragItemEnterEvent, TDragItemLeaveEvent, TDragLeaveEvent, TDragOverEvent, TDragStartEvent, TDropEvent, TDropItemEvent } from '../drag/drag.service';
import { DraggableComponent } from '../drag/draggable/draggable.component';
import { DraggableItemComponent } from '../drag/draggable-item/draggable-item.component';
import { CanvasComponent } from '../canvas/canvas.component';
import { CanvasPanelComponent, TCanvasPanelItem, TPanelDragEndEvent, TPanelDragStartEvent } from '../canvas/canvas-panel/canvas-panel.component';
import CanvasObject from '../canvas/canvasObject';
import CanvasLayout from '../canvas/canvasLayout';
import { AlgorithmObject } from '../../object/algorithm/algorithm';
import { Position } from '../canvas/ref';
import { BubbleSortObject } from '../../object/algorithm/sort/bubble';
import DataStructureObject from '../../object/data-structure/dataStructure';
import { ArrayObject } from '../../object/data-structure/array';
import { StackObject } from '../../object/data-structure/stack';
import { QueueObject } from '../../object/data-structure/queue';
import MergeSortObject from '../../object/algorithm/sort/merge';
import { CanvasService, TAddCanvasObjectEvent, TRemoveCanvasObjectEvent } from '../canvas/canvas.service';
import GraphObject, { GraphNode } from '../../object/data-structure/graph';
import Graph from '../../utils/graph';
import { DFSObject } from '../../object/algorithm/graph/dfs';
import { RefObject } from '../../object/data-structure/ref';
import { LinkListObject } from '../../object/data-structure/linkList';
import HashMapObject, { strHash } from '../../object/data-structure/hashMap';
import { QuickSortObject } from '../../object/algorithm/sort/quick';
import { TreeNodeObject, TreeObject } from '../../object/data-structure/tree';
import { HeapObject } from '../../object/data-structure/heap';
import { DijkstraObject } from '../../object/algorithm/graph/dijkstra';
import { BuildHeapObject } from '../../object/algorithm/buidHeap';
import { HeapSortObject } from '../../object/algorithm/sort/heap';
import { InsertSortObject } from '../../object/algorithm/sort/insert';
import { SelectSortObject } from '../../object/algorithm/sort/select';

export const Items: Record<string, TCanvasPanelItem[]> = {
  'ds': [
    {
      id: 'array',
      name: '数组',
    },
    {
      id: 'stack',
      name: '栈',
    },
    {
      id: 'queue',
      name: '队列',
    },
    {
      id: 'graph',
      name: '图',
    },
    {
      id: 'linklist',
      name: '链表',
    },
    {
      id: 'tree',
      name: '树',
    },
    {
      id: 'heap',
      name: '堆',
    },
    {
      id: 'hashmap',
      name: '散列表',
    },
    {
      id: '?',
      name: '?',
    },
  ],
  'alg': [
    {
      id: 'insert-sort',
      name: '插入排序'
    },
    {
      id: 'select-sort',
      name: '选择排序'
    },
    {
      id: 'bubble-sort',
      name: '冒泡排序'
    },
    {
      id: 'merge-sort',
      name: '归并排序'
    },
    {
      id: 'quick-sort',
      name: '快速排序'
    },
    {
      id: 'heap-sort',
      name: '堆排序'
    },
    {
      id: 'build-heap',
      name: '建堆'
    },
    {
      id: 'dfs',
      name: 'DFS',
    },
    {
      id: 'dijkstra',
      name: 'Dijkstra'
    },
  ]
}

export const ItemGroupInfos: { id: keyof typeof Items, name: string }[] = [
  {
    id: 'ds',
    name: '数据结构'
  },
  {
    id: 'alg',
    name: '算法'
  }
]

export function createObject(id: string, type: string, key: string) {
  // todo
  let obj
  if (key === 'ds') {
    obj = createDataStructure(id, type)
  } else if (key === 'alg') {
    obj = createAlgorithm(id, type)
  }
  return new CanvasObject(obj!.id, obj!.type, obj!)
}

export function createAlgorithm(id: string, type: string): AlgorithmObject {
  switch (type) {
    case 'insert-sort':
      return new InsertSortObject(id)
    case 'select-sort':
      return new SelectSortObject(id)
    case 'bubble-sort':
      return new BubbleSortObject(id)
    case 'merge-sort':
      return new MergeSortObject(id)
    case 'quick-sort':
      return new QuickSortObject(id)
    case 'heap-sort':
      return new HeapSortObject(id)
    case 'build-heap':
      return new BuildHeapObject(id)
    case 'dfs':
      return new DFSObject(id)
    case 'dijkstra':
      return new DijkstraObject(id)
    default:
      return new AlgorithmObject(id, type, 'Unknown')
  }
}

export function createDataStructure(id: string, type: string): DataStructureObject {
  switch (type) {
    case 'array':
      //! for debug
      const arr: any[] = randomArray(5, 0, 10)
      arr.push(new RefObject(id + '-nest', new ArrayObject(id + '-nest', randomArray(5, 0, 10))))
      return new ArrayObject(id, randomArray(5, 0, 10))
      // return new ArrayObject(id)
    case 'stack':
      //! for debug
      return new StackObject(id, randomArray(5, 0, 10))
    case 'queue':
      //! for debug
      return new QueueObject(id, randomArray(5, 0, 10))
    case 'graph':
      // ! for debug
      const graph = new Graph<string, GraphNode<string>>()
      graph.addNode(new GraphNode<string>('A', 'A'))
      graph.addNode(new GraphNode<string>('B', 'B'))
      graph.addNode(new GraphNode<string>('C', 'C'))
      graph.addNode(new GraphNode<string>('D', 'D'))
      graph.addNode(new GraphNode<string>('E', 'E'))
      graph.addEdge('A', 'B', 1)
      graph.addEdge('A', 'C', 2)
      graph.addEdge('A', 'D', 3)
      graph.addEdge('B', 'E', 4)
      graph.addEdge('C', 'E', 1)
      graph.addEdge('D', 'E', 2)
      return new GraphObject(id, graph)
      // return new GraphObject(id)
    case 'linklist':
      return new LinkListObject(id, [1, 2, 3, 4, 5])
    case 'tree':
      const tree = new TreeObject(id, 2)
      const init0 = new TreeNodeObject('init0', 'A', tree)
      const init1 = new TreeNodeObject('init1', 'B', tree)
      const init2 = new TreeNodeObject('init2', 'C', tree)
      const init3 = new TreeNodeObject('init3', 'D', tree)
      const init4 = new TreeNodeObject('init4', 'E', tree)
      const init5 = new TreeNodeObject('init5', 'F', tree)
      tree.insert(init0)
      tree.insert(init1, init0)
      tree.insert(init2, init0)
      tree.insert(init3, init1)
      tree.insert(init4, init1)
      tree.insert(init5, init2)
      return tree
    case 'heap':
      const heap = new HeapObject(id)
      heap.push(1)
      heap.push(2)
      heap.push(3)
      return heap
    case 'hashmap':
      const map: Map<string, string> = new Map([
        ['a', 'A'],
        ['b', 'B'],
        ['c', 'C'],
        ['d', 'D'],
        ['e', 'E'],
        ['f', 'F'],
        ['g', 'G'],
      ])
      return new HashMapObject(id, 5, strHash, map)
    default:
      return new DataStructureObject(id, type)
  }
}

export class CanvasHandler {
  id: string | null = null
  type: string | null = null
  objects: CanvasObject<any>[] = []
  objectMap: Map<string, CanvasObject<DataStructureObject | AlgorithmObject>> = new Map()
  layout: CanvasLayout;
  _service: CanvasService | null = null

  get service() {
    return this._service
  }

  set service(service: CanvasService | null) {
    this._service = service
  }

  constructor(objects: CanvasObject<any>[] = [], layout: CanvasLayout = new CanvasLayout()) {
    this.layout = layout.copy()
    objects.forEach(obj => this.add(obj, this.layout.get(obj.id)))
  }

  onDragStart({ id, type, raw }: TPanelDragStartEvent) {
    this.id = id as string
    this.type = type
  }

  onDragEnd({ id, type, raw }: TPanelDragEndEvent) {
    this.id = null
    this.type = null
  }

  onDragItemStart(event: TDragStartEvent) {
    const id = String(event.key)
    if (id.includes('#')) {
      // 是有父亲节点的子节点
      return
    }
    this.service?.onEnter((tgts) => {}, {
      isEnterable: (obj: any) => 
        (obj instanceof DataStructureObject && this.checkEnterDS({ src: id, tgts: [obj.id] }).src !== undefined)
        || (obj instanceof AlgorithmObject && this.checkEnterAlg({ src: id, tgts: [obj.id] }).src !== undefined)
    })
  }

  onDragItemEnd(event: TDragEndEvent) {
  }

  onDragEnterCanvas(event: TDragEnterEvent) {
  }

  onDragLeaveCanvas(event: TDragLeaveEvent) {
  }

  onDragOverCanvas(event: TDragOverEvent) {
  }

  onDropOnCanvas(event: TDropEvent) {
    if (this.id === null) {
      console.warn('drop but key is null')
      return
    }
    const { position } = event
    const obj = this.createObject(this.id, this.type!)
    this.add(obj, position)
  }

  checkEnterAlg({ src, tgts }: { src: any, tgts: any[] }) {
    const srcObj = this.objectMap.get(String(src))
    const tgtObj = this.objectMap.get(String(tgts[0]))
    if (
      srcObj && tgtObj
      && !tgtObj.props.readonly
      && srcObj.data instanceof DataStructureObject
      && tgtObj.data instanceof AlgorithmObject
      && tgtObj.data.check(srcObj.data)
    ) {
      return {
        src: srcObj as CanvasObject<DataStructureObject>,
        tgt: tgtObj as CanvasObject<AlgorithmObject>,
      }
    }
    return {}
  }

  checkEnterDS({ src, tgts }: { src: any, tgts: any[] }) {
    const srcObj = this.objectMap.get(String(src))
    const tgtObj = this.objectMap.get(String(tgts[0]))
    if (
      srcObj && tgtObj
      && !tgtObj.props.readonly
      && tgtObj.data instanceof DataStructureObject
      && srcObj.data instanceof DataStructureObject
      && tgtObj.data.check(srcObj.data)
    ) {
      return {
        src: srcObj as CanvasObject<DataStructureObject>,
        tgt: tgtObj as CanvasObject<DataStructureObject>,
      }
    }
    return {}
  }

  add(obj: CanvasObject<any>, position: Position = { x: 0, y: 0 }) {
    this.objectMap.set(obj.id, obj)
    this.objects = [...this.objects, obj]
    this.layout = this.layout.set(obj.id, position).copy()
  }

  remove(obj: CanvasObject<any>) {
    this.objects.splice(this.objects.indexOf(obj), 1)
    this.objects = this.objects.slice()
    this.objectMap.delete(obj.id)
    this.layout.delete(obj.id)
  }

  onAdd({ object }: TAddCanvasObjectEvent) {
    this.add(object, object.props.position)
  }

  onRemove({ id }: TRemoveCanvasObjectEvent) {
    this.remove(this.objectMap.get(id)!)
  }

  onDragEnterObject(event: TDragItemEnterEvent) {

  }

  onDragLeaveObject(event: TDragItemLeaveEvent) {

  }

  onDropOnObject(event: TDropItemEvent) {
    const { src, tgt } = this.checkEnterAlg(event)
    if (src && tgt) {
      this.remove(src);
      tgt.data.bind(src.data)
    } else {
      const { src, tgt } = this.checkEnterDS(event) 
      if (src && tgt) {
        this.remove(src);
        tgt.data.accept(src.data)
      }
    }
  }

  private incrId = 0
  createObject(type: string, key: string) {
    return createObject(`${this.incrId++}-${type}`, type, key)
  }
}

@Component({
  selector: 'app-repository',
  standalone: true,
  imports: [
    CommonModule,
    CanvasComponent,
    CanvasPanelComponent,
    DraggableComponent,
    DraggableItemComponent
  ],
  templateUrl: './repository.component.html',
  styleUrl: './repository.component.scss'
})
export class RepositoryComponent extends CanvasHandler implements AfterViewInit {
  @ViewChild('canvas') canvas!: CanvasComponent;
  @ViewChild('panel') panel!: CanvasPanelComponent;

  items = Items
  itemGroupInfos = ItemGroupInfos
  options: [] = []

  constructor() {
    super()
  }

  ngAfterViewInit(): void {
    this.service = this.canvas.canvasService
  }
}

function randomArray(length: number, min: number, max: number): number[] {
  const array: number[] = [];
  for (let i = 0; i < length; i++) {
    array.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return array;
}
