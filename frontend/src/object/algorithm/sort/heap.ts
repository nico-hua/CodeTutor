import ArrayObject from "../../data-structure/array";
import DataStructureObject from "../../data-structure/dataStructure";
import { HeapObject } from "../../data-structure/heap";
import { AlgorithmObject, DataStructureTracer } from "../algorithm";
import { BuildHeapObject } from "../buidHeap";

export class HeapSortObject extends AlgorithmObject {
  constructor(id: string) {
    super(id, 'heap-sort', '堆排序')
  }
  override check(...inputs: DataStructureObject[]) {
    return inputs.length === 1 && inputs[0] instanceof ArrayObject
  }
  override bind(...inputs: DataStructureObject[]) {
    this.unbind()

    const array = inputs[0] as ArrayObject<any>
    const init = array.copy().succeed(array)
    this.states.push({
      emitter: init,
      data: [init],
      operations: [],
      children: []
    })

    const buildHeap = new BuildHeapObject(this.id + '-build-heap').bind(array)
    const heap = buildHeap.return[1] as HeapObject<any>
    const ret = new ArrayObject<any>(this.id + '-ret')

    const emitter = array.copy().succeed(array)
    this.states.push({
      emitter,
      data: [emitter],
      operations: [],
      children: [buildHeap]
    })

    const tracer = new DataStructureTracer()
    tracer.begin(array, heap, ret)

    while (heap.length > 0) {
      ret.push(heap.pop())
    }
    
    this.states.push(...tracer.end())
    return super.bind(...inputs)
  }
}