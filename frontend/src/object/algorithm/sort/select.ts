import { ArrayObject } from "../../data-structure/array";
import DataStructureObject from "../../data-structure/dataStructure";
import { AlgorithmObject, DataStructureTracer } from "../algorithm";

export class SelectSortObject extends AlgorithmObject {
  constructor(id: string) {
    super(id, 'select-sort', '选择排序')
  }

  override check(...inputs: DataStructureObject[]): boolean {
    return inputs.length === 1 && inputs[0] instanceof ArrayObject
  }

  override bind(...inputs: DataStructureObject[]) {
    this.unbind()

    const array = inputs[0] as ArrayObject<any>;
    const init = array.copy().succeed(array)
    
    this.states.push({
      operations: [],
      data: [init],
      emitter: init,
      children: [],
    })

    const tmp = new ArrayObject(this.id + '-tmp', new Array(array.length))

    const tracer = new DataStructureTracer()
    tracer.begin(array, { data: tmp, config: { trace: false } })

    for (let i = 0; i < array.length; i++) {
      let minIndex = i;
      tmp.set(i, array.get(i))
      for (let j = i + 1; j < array.length; j++) {
        if (array.compare(j, minIndex)) {
          tmp.set(j, array.get(j))
          tmp.set(minIndex, undefined)
          minIndex = j;
        }
      }
      tmp.set(minIndex, undefined)
      if (minIndex !== i) {
        array.swap(minIndex, i)
      }
    }

    this.states.push(...tracer.end())

    const ret = array.copy().succeed(array)
    this.states.push({
      operations: [],
      data: [ret],
      emitter: ret,
      children: [],
    })

    return super.bind(...inputs)
  }
}