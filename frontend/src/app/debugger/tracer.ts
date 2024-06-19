import { Frame } from "./runtime-view/frame/frame.component";
import { Variable } from "./variable";

export type TEvent = "step_line" | "call" | "return" | "uncaught_exception"

export type TLiteral = number | string

export type TAddress = string | null

export type TRef = ["REF", TAddress]
export type TStackVariable = TLiteral | TRef
export type TTuple = ["TUPLE", ...TStackVariable[]]
export type TList = ["LIST", ...TStackVariable[]]
export type TSet = ["SET", ...TStackVariable[]]
export type TKeyValue = [TLiteral, TStackVariable]
export type TDict = ["DICT", ...TKeyValue[]]
export type TClass = ["CLASS", string, ...TKeyValue[]]
export type TFunction = ["FUNCTION", string, null]
export type THeapVariable = TStackVariable | TTuple | TList | TSet | TDict | TFunction | TClass

export type TFrame = {
  frame_id: number;
  encoded_locals: Record<string, TStackVariable>;
  is_highlighted: boolean;
  is_parent: boolean;
  func_name: string;
  is_zombie: boolean;
  parent_frame_id_list: number[];
  unique_hash: string;
  ordered_varnames: string[]
}

export interface Trace {
  ordered_globals: string[];
  stdout: string;
  func_name: string;
  stack_to_render: TFrame[];
  globals: Record<string, TStackVariable>;
  heap: Record<string, THeapVariable>;
  line: number;
  event: Event;
}

export default class Tracer {
  private _curStep = 0;
  private _frames: Frame[] = []
  private _heap: Variable<any>[] = []
  private _globals: Variable<any>[] = []
  private _objects: Variable<any>[] = []

  constructor(private traces: Trace[]) {
    this.goto(0)
  }

  public get curLine() {
    return this.trace.line
  }

  public get curStep() {
    return this._curStep
  }

  public get maxStep() {
    return this.traces.length - 1
  }

  public get minStep() {
    return 0
  }

  private get trace() {
    return this.traces[this.curStep]
  }

  get globals() {
    return this._globals
  }

  get heap() {
    return this._heap
  }

  get frames() {
    return this._frames
  }

  get objects() {
    return this._objects
  }

  getGlobals(): Variable<any>[] {
    const globals = []
    const { trace } = this
    for (const name of trace.ordered_globals) {
      const variable = trace.globals[name]
      const global = Variable.create(variable, `${name}`)
      if (global) globals.push(global)
    }
    return globals
  }

  getHeap(): Variable<any>[] {
    const heap = []
    const { trace } = this
    for (const id in trace.heap) {
      const variable = trace.heap[id]
      const obj = Variable.create(variable, `${id}`)
      if (obj) heap.push(obj)
    }
    return heap
  }

  getFrames(): Frame[] {
    const { trace } = this
    const frames = []
    for (const frame of trace.stack_to_render) {
      const items = []
      for (const name of frame.ordered_varnames) {
        const variable = frame.encoded_locals[name]
        const item = Variable.create(variable, name)
        if (item) items.push(item)
      }
      frames.push({ 
        id: frame.frame_id, 
        name: frame.func_name,
        isCurrent: frame.is_highlighted, 
        items 
      })
    }
    return frames
  }

  goto(step: number) {
    if (step == this.curStep) {
      return
    }
    this._curStep = Math.min(Math.max(step, this.minStep), this.maxStep)
    this._frames = this.getFrames()
    this._globals = this.getGlobals()
    this._heap = this.getHeap()
    this._objects = [...this._globals, ...this._heap]
  }
}