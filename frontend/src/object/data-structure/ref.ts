import { AlgorithmObject } from "../algorithm/algorithm";
import DataStructureObject from "./dataStructure";

export class RefObject<T extends DataStructureObject | AlgorithmObject> extends DataStructureObject {
  static Event = {
    GET: Symbol('get'),
    UPDATE: Symbol('update'),
  }
  
  private _value: T | (() => T);
  constructor(id: string, value: T | (() => T)) {
    super(id, 'ref');
    this._value = value;
  }

  override get value() {
    const v = typeof this._value === 'function' ? this._value() : this._value
    this.notify(RefObject.Event.GET, v);
    return v;
  }

  override set value(value: T) {
    this._value = value;
    this.notify(RefObject.Event.UPDATE, value);
  }
}