import DataStructureObject from "./dataStructure";

export class LiteralObject<T extends string | number = string> extends DataStructureObject {
  constructor(id: string, value: T) {
    super(id, 'literal')
    this._value = value
  }

  private _value: T
  override get value() {
    return this._value
  }
  override set value(value: T) {
    this.value = value
  }
}