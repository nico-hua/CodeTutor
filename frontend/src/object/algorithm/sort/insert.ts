import { ArrayObject } from '../../data-structure/array';
import DataStructureObject from '../../data-structure/dataStructure';
import { AlgorithmObject, DataStructureTracer } from '../algorithm';

export class InsertSortObject extends AlgorithmObject {
  constructor(id: string) {
    super(id, 'insert-sort', '插入排序');
  }

  override check(...inputs: DataStructureObject[]): boolean {
    return inputs.length === 1 && inputs[0] instanceof ArrayObject;
  }

  override bind(...inputs: DataStructureObject[]) {
    this.unbind();

    const array = inputs[0] as ArrayObject<any>;
    const init = array.copy().succeed(array);

    this.states.push({
      operations: [],
      data: [init],
      emitter: init,
      children: [],
    });

    const tmp = new ArrayObject(array.id + '-tmp', new Array(array.length));

    const tracer = new DataStructureTracer();
    tracer.begin(array, { data: tmp, config: { trace: false } });

    for (let i = 1; i < array.length; i++) {
      let key = array.get(i);
      let j = i - 1;
      tmp.set(i, key)
      while (j >= 0) {
        const cur = array.get(j)
        if (cur <= key) {
          tmp.set(j + 1, undefined)
          break
        }
        tmp.set(j, key)
        tmp.set(j + 1, undefined)
        array.set(j + 1, cur);
        j--;
      }
      array.set(j + 1, key);
      tmp.set(i, undefined)
    }

    this.states.push(...tracer.end());

    const ret = array.copy().succeed(array);
    this.states.push({
      emitter: ret,
      data: [ret],
      operations: [],
      children: []
    })
    return super.bind(...inputs);
  }
}
