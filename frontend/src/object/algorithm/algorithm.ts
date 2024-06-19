import Emitter from '../../utils/emitter';
import {
  DataStructureObject,
  TOperation,
} from '../data-structure/dataStructure';

export type TAlgorithmState = {
  operations: TOperation[];
  emitter: DataStructureObject;
  data: DataStructureObject[];
  children: AlgorithmObject[];
};

export class AlgorithmObject {
  static Event = {
    BIND: Symbol('bind'), // 与输入绑定完成，能够获取states
    UNBIND: Symbol('unbind'), // 解除绑定
  };

  static State = {
    NONE: Symbol('none'),
    BINDED: Symbol('binded'),
  };

  private _id: string;
  private _type: string;
  private _name: string;
  private emitter = new Emitter();
  private state = AlgorithmObject.State.NONE;
  protected inputs: DataStructureObject[] | null = null;
  protected curState: TAlgorithmState | null = null;
  protected states: TAlgorithmState[] = [];
  constructor(id: string, type: string, name: string) {
    this._id = id;
    this._type = `alg-${type}`;
    this._name = name;
  }

  get id() {
    return this._id;
  }

  get type() {
    return this._type;
  }

  get name() {
    return this._name;
  }

  get return() {
    if (this.states.length === 0) {
      console.log('not bind before return');
      return [];
    }
    return this.states[this.states.length - 1].data.map(ds => ds.copy().succeed(ds));
  }

  /**
   * 校验输入
   * @param inputs
   * @returns 是否通过校验
   */
  check(...inputs: DataStructureObject[]) {
    return false;
  }

  /**
   * 绑定输入数据结构，须在子类中实现
   * @param inputs
   * @returns this
   */
  bind(...inputs: DataStructureObject[]) {
    if (this.state === AlgorithmObject.State.BINDED) {
      this.notify(AlgorithmObject.Event.UNBIND);
    }
    this.state = AlgorithmObject.State.BINDED;
    this.inputs = inputs.map((input) => input.copy());
    this.notify(AlgorithmObject.Event.BIND, this.states, ...inputs);
    return this;
  }

  unbind() {
    this.state = AlgorithmObject.State.NONE;
    this.inputs = null;
    this.curState = null;
    this.states = [];
    this.notify(AlgorithmObject.Event.UNBIND);
    return this;
  }

  notify(event: string | symbol, ...args: any[]) {
    this.emitter.notify(event, ...args);
    return this;
  }

  onBind(
    callback: (
      states: TAlgorithmState[],
      ...inputs: DataStructureObject[]
    ) => void
  ) {
    // 如果已经绑定了，会立即执行一次
    if (this.state === AlgorithmObject.State.BINDED) {
      callback(this.states, ...this.inputs!);
    }
    this.emitter.on(AlgorithmObject.Event.BIND, callback);
    return this;
  }

  offBind(
    callback: (
      states: TAlgorithmState[],
      ...inputs: DataStructureObject[]
    ) => void
  ) {
    this.emitter.off(AlgorithmObject.Event.BIND, callback);
    return this;
  }

  onUnbind(callback: () => void) {
    this.emitter.once(AlgorithmObject.Event.UNBIND, callback);
    return this;
  }

  offUnbind(callback: () => void) {
    this.emitter.off(AlgorithmObject.Event.UNBIND, callback);
    return this;
  }
}

export type TConfig = {
  recursive?: boolean;
  trace?: boolean;
};

const DefaultConfig: TConfig = {
  recursive: false,
  trace: true,
};

export class DataStructureTracer {
  private callbacks: {
    data: DataStructureObject;
    callback: (event: string | symbol, ...args: any[]) => void;
  }[] = [];
  private isBeginning = false;
  private states: TAlgorithmState[] = [];
  private dsSet: Set<DataStructureObject> = new Set();
  private children: {
    root: number;
    getter: (root: DataStructureObject) => DataStructureObject;
  }[] = [];
  private ds2index: WeakMap<DataStructureObject, number> = new WeakMap();
  private data: DataStructureObject[] = [];
  private configs: TConfig[] = [];

  private collateAll(datas: DataStructureObject[]) {
    this.data = datas.slice();
    datas.forEach((data) => this._collateAll(data));
  }

  private _collateAll(
    ds: DataStructureObject,
    root: DataStructureObject = ds,
    paths: string[] = []
  ) {
    this.dsSet.add(ds);
    if (
      ds === root &&
      this.ds2index.has(ds) &&
      !this.configs[this.ds2index.get(ds)!].recursive
    ) {
      return;
    }
    for (const key in ds) {
      if (ds.hasOwnProperty(key)) {
        const value = ds[key as keyof DataStructureObject];
        if (value instanceof DataStructureObject && !this.dsSet.has(value)) {
          paths.push(key);
          this.dsSet.add(value);
          if (root) {
            this.ds2index.set(value, this.data.length + this.children.length);
            const keys = paths.slice();
            this.children.push({
              root: this.ds2index.get(root)!,
              getter: (root: DataStructureObject) =>
                keys
                  .slice()
                  .reduce(
                    (parent, key) =>
                      parent[
                        key as keyof DataStructureObject
                      ] as DataStructureObject,
                    root
                  ),
            });
          }
          this._collateAll(value, root, paths);
          paths.pop();
        }
      }
    }
  }

  begin(
    ...datas: (
      | DataStructureObject
      | { data: DataStructureObject; config: TConfig }
    )[]
  ) {
    this.end();

    this.isBeginning = true;

    const dss: DataStructureObject[] = datas.map((data, index) => {
      const ds = data instanceof DataStructureObject ? data : data.data;
      const config =
        data instanceof DataStructureObject
          ? DefaultConfig
          : Object.assign({}, DefaultConfig, data.config);
      this.ds2index.set(ds, index);
      this.configs.push(config);
      return ds;
    });
    this.collateAll(dss);
    this.dsSet.forEach((data) => {
      let index = this.ds2index.get(data)!;
      if (index < datas.length && !this.configs[index].trace) {
        return;
      }
      const callback = this.onNotify.bind(this, index);
      this.callbacks.push({ data, callback });
      data.onNotify(callback).beginRecord();
    });
  }

  end() {
    this.isBeginning = false;
    this.callbacks.forEach(({ data, callback }) => {
      data.offNotify(callback).endRecord();
    });
    this.data = [];
    this.configs = [];
    this.children = [];
    this.dsSet = new Set();
    this.ds2index = new WeakMap();
    this.callbacks = [];
    const states = this.states.slice();
    this.states = [];
    return states;
  }

  private curEmitterIndex = -1;
  private onNotify(
    emitterIndex: number,
    event: string | symbol,
    ...args: any[]
  ) {
    if (!this.isBeginning) return;
    // avoid self recursion
    if (emitterIndex === this.curEmitterIndex) return;
    const oldEmitterIndex = this.curEmitterIndex;
    this.curEmitterIndex = emitterIndex;
    
    // avoid being recorded when copying
    this.isBeginning = false
    const data = this.data.map((data) => data.copy().succeed(data));
    this.isBeginning = true
    
    let emitter = data[emitterIndex];

    if (!emitter) {
      const { root, getter } = this.children[emitterIndex - this.data.length]!;
      emitter = getter(data[root]);
    }

    this.states.push({
      emitter,
      operations: [
        {
          event,
          args,
        },
      ],
      data,
      children: [],
    });
    this.curEmitterIndex = oldEmitterIndex;
  }
}
