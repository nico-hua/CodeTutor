import { ArrayObject } from "../../data-structure/array";
import DataStructureObject from "../../data-structure/dataStructure";
import { AlgorithmObject, DataStructureTracer } from "../algorithm";

export class BubbleSortObject extends AlgorithmObject {
  constructor(id: string) {
    super(id, 'bubble-sort', '冒泡排序')
  }

  override check(...inputs: DataStructureObject[]): boolean {
    return inputs.length === 1 && inputs[0].type === 'ds-array'
  }

  override bind(...inputs: DataStructureObject[]) {
    this.states = []
    const initArray = inputs[0].copy().succeed(inputs[0]) as ArrayObject<any>;
    const array = initArray.copy()
    // 初试状态
    this.states.push({
      operations: [],
      data: [initArray],
      emitter: initArray,
      children: [],
    })

    const tracer = new DataStructureTracer()
    tracer.begin(array)
    for (let i = 0; i < array.length - 1; i++) {
      for (let j = 0; j < array.length - 1 - i; j++) {
        array.beginRecord()
        if (array.compare(j + 1, j)) {
          array.swap(j, j + 1);
        }
      }
    }
    this.states.push(...tracer.end())

    return super.bind(...inputs)
  }
}

export default BubbleSortObject;