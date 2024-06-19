import Emitter from "../../utils/emitter";

export type TOperation = {
  event: string | symbol;
  args: any[];
}

export class DataStructureObject {
  private _id: string;
  private _type: string;
  private _val: unknown;
  private isRecording = false
  private isEmitting = false
  private operations: TOperation[] = []
  private emiter = new Emitter()
  constructor(id: string, type: string, value?: unknown) {
    this._id = id
    this._type = `ds-${type}`
    this._val = value
  }

  get id() {
    return this._id
  }

  get type() {
    return this._type
  }

  get value() {
    return this._val
  }

  check(...others: DataStructureObject[]) {
    return false
  }

  accept(...others: DataStructureObject[]) {}

  on(event: string | symbol, callback: Function) {
    this.emiter.on(event, callback)
    return this
  }

  off(event: string | symbol, callback: Function) {
    this.emiter.off(event, callback)
    return this
  }

  notify(event: string | symbol, ...args: any[]) {
    this.emiter.notify(DataStructureObject.NOTIFY, event, ...args)
    if (this.isRecording) {
      this.operations.push({
        event,
        args
      })
    } else if (this.isEmitting) {
      this.emiter.notify(event, ...args)
    }
    return this
  }

  static NOTIFY = Symbol('notify')
  onNotify(callback: (event: string | symbol, ...args: any[]) => void) {
    this.on(DataStructureObject.NOTIFY, callback)
    return this
  }

  offNotify(callback: (event: string | symbol, ...args: any[]) => void) {
    this.off(DataStructureObject.NOTIFY, callback)
    return this
  }

  /**
   * 开始记录一段操作
   */
  beginRecord() {
    this.isRecording = true
    this.operations = []
    return this
  }

  /**
   * 结束记录一段操作
   * @returns 操作列表
   */
  endRecord() {
    this.isRecording = false
    return this.operations
  }

  begin() {
    this.isEmitting = true
    return this
  }

  end() {
    this.isEmitting = false
    return this
  }

  /**
   * 仅复制数据，建议提供新的id
   * @param id 
   * @returns 
   */
  copy(id?: string) {
    if (id === undefined) {
      id = this.id
    }
    return new DataStructureObject(id, this.type)
  }

  /**
   * 继承other的所有订阅者
   * @param other 
   * @returns 
   */
  succeed(other: DataStructureObject) {
    this.emiter = other.emiter.copy()
    return this
  }
}

export default DataStructureObject;