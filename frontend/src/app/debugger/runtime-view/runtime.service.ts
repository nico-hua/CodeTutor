import { Injectable } from '@angular/core';
import DataStructureObject from '../../../object/data-structure/dataStructure';
import { AlgorithmObject } from '../../../object/algorithm/algorithm';
import { DictKeyValue, ItemVariable, Variable } from '../variable';
import { LiteralObject } from '../../../object/data-structure/literal';
import { RefObject } from '../../../object/data-structure/ref';
import ArrayObject from '../../../object/data-structure/array';
import HashMapObject, { strHash } from '../../../object/data-structure/hashMap';
import { RuntimeViewComponent } from './runtime-view.component';

@Injectable({
  providedIn: 'root'
})
export class RuntimeService {
  private _uid = 0
  uid(id?: string) {
    return `#HEAP${this._uid++}${id ? '-' + id : ''}`
  }

  objMap: Map<string, DataStructureObject | AlgorithmObject> = new Map()
  createObject(variable: Variable<any>): DataStructureObject | AlgorithmObject {
    const { id, type, name, value } = variable
    let obj: DataStructureObject | AlgorithmObject;
    // todo other type
    switch(type) {
      case 'LITERAL':
        obj = new LiteralObject(id, value)
        break
      case 'REF':
        obj = new RefObject(id, () =>this.objMap.get(String(value))!)
        break
      case 'TUPLE':
      case 'SET':
      case 'LIST':
        const arr: unknown[] = []
        for (const v of value as ItemVariable[]) {
          if (v.type === 'REF') {
            arr.push(new RefObject(v.id, () => this.objMap.get(String(v.value))!))
          } else {
            arr.push(v.value)
          }
        }
        obj = new ArrayObject(id, arr)
        break
      case 'FUNCTION':
        obj = new AlgorithmObject(id, 'function', name)
        break
      case 'DICT':
      case 'CLASS':
      case 'INSTANCE':
        const dict = value as DictKeyValue[]
        const map = new Map<string, any>()
        for (const [k, v] of dict) {
          if (v.type === 'REF') {
            map.set(String(k.value), new RefObject(v.id, () => this.objMap.get(String(v.value))!))
          } else [
            map.set(String(k.value), v.value)
          ]
        }
        obj = new HashMapObject(id, 5, strHash, map)
        break
      default:
        obj = new DataStructureObject(id, type)
    }
    this.objMap.set(obj.id, obj)
    return obj
  } 

  render() {
    this.context?.render()
  }

  private context: RuntimeViewComponent | null = null
  register(context: RuntimeViewComponent) {
    this.context = context
  }
}
