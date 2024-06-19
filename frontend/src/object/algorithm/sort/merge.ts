import ArrayObject from "../../data-structure/array";
import DataStructureObject from "../../data-structure/dataStructure";
import { AlgorithmObject, DataStructureTracer } from "../algorithm";

class MergeSortObject extends AlgorithmObject {
  static MergeEvent = {
    RECURSION: Symbol('recursion'),
    MERGE: Symbol('merge'),
  }

  constructor(id: string) {
    super(id, 'merge-sort', '归并排序')
  }

  override check(...inputs: DataStructureObject[]): boolean {
    return inputs.length === 1 && inputs[0].type === 'ds-array'
  }

  override bind(...inputs: DataStructureObject[]) {
    const initArray = inputs[0].copy().succeed(inputs[0]) as ArrayObject<any>
    
    // 初试状态
    this.states = [{
      emitter: initArray,
      operations: [],
      data: [initArray],
      children: [],
    }]
    
    const array = initArray.copy()
    /**********************/
    if (array.length <= 1) {
    /**********************/
      this.states.push({
        emitter: initArray,
        operations: [],
        data: [initArray, initArray.copy().succeed(initArray)],
        children: [],
      })
      return super.bind(...inputs)
    }

    array.beginRecord()
    /***********************************************************/
    const mid = Math.floor(array.length / 2)
    const left = array.slice(0, mid)
    const right = array.slice(mid)

    const leftAlg = new MergeSortObject(this.id + '-l').bind(left)
    const rightAlg = new MergeSortObject(this.id + '-r').bind(right)
    /*************************************************************/
    let emitter = array.copy().succeed(initArray)
    this.states.push({
      emitter,
      operations: array.endRecord(),
      data: [
        emitter, 
      ],
      children: [leftAlg, rightAlg],
    })

    // merge
    /***************************************************/
    const leftRet = leftAlg.return[1] as ArrayObject<any>
    const rightRet = rightAlg.return[1] as ArrayObject<any>
    
    const tracer = new DataStructureTracer()

    const init = initArray.copy().succeed(initArray)
    const tmp = new ArrayObject<any>(`${array.id}-tmp`, [])
    
    const arr1 = leftRet.copy().succeed(leftRet)
    const arr2 = rightRet.copy().succeed(rightRet)

    tracer.begin(init, arr1, arr2, tmp)

    /*******************************************/
    let i = 0, j = 0;
    while (i < arr1.length || j < arr2.length) {
      if (j == arr2.length || arr1.get(i) <= arr2.get(j)) {
        tmp.push(arr1.get(i));
        i++
      } else {
        tmp.push(arr2.get(j));
        j++
      }
    }
    /*******************************************/
    this.states.push(...tracer.end())

    const ret = tmp.copy().succeed(tmp)
    this.states.push({
      emitter: ret,
      operations: [],
      data: [init.copy().succeed(init), ret],
      children: []
    })
    
    return super.bind(...inputs)
  }
}

export default MergeSortObject