import ArrayObject from '../../data-structure/array';
import DataStructureObject from '../../data-structure/dataStructure';
import { AlgorithmObject, DataStructureTracer } from '../algorithm';

export class QuickSortObject extends AlgorithmObject {
  constructor(id: string) {
    super(id, 'quick-sort', '快速排序');
  }
  override check(...inputs: DataStructureObject[]): boolean {
    return inputs.length === 1 && inputs[0] instanceof ArrayObject;
  }

  override bind(...inputs: DataStructureObject[]) {
    this.states = [];
    const initArray = inputs[0].copy().succeed(inputs[0]) as ArrayObject<any>;
    const array = initArray.copy();

    this.states.push({
      operations: [],
      data: [initArray],
      emitter: initArray,
      children: [],
    });

    if (array.length > 1) {
      const tracer = new DataStructureTracer();
      tracer.begin(array);
      
      const pivotIndex = array.length - 1
      const pivot = array.get(pivotIndex)
      let j = -1;
      for (let i = 0; i < array.length; i++) {
        if (array.compare(i, pivotIndex)) {
          j++;
          array.swap(i, j);
        }
      }
      array.swap(j + 1, array.length - 1);
      this.states.push(...tracer.end());

      const left = array.slice(0, j + 1);
      const right = array.slice(j + 2);

      const lAlg = new QuickSortObject(this.id + '-l').bind(left);
      const rAlg = new QuickSortObject(this.id + '-r').bind(right);

      const emitter = array.copy().succeed(array);
      this.states.push({
        operations: [],
        data: [emitter, left, right],
        emitter,
        children: [lAlg, rAlg],
      });

      const lRet = lAlg.return[0] as ArrayObject<any>;
      const rRet = rAlg.return[0] as ArrayObject<any>;

      const ret = lRet.copy();
      ret.push(pivot);
      for (const v of rRet) {
        ret.push(v);
      }
      this.states.push({
        emitter: ret,
        data: [ret],
        operations: [],
        children: [],
      });
    }

    return super.bind(...inputs);
  }
}
