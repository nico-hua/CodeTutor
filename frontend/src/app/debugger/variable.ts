import { THeapVariable, TLiteral, TStackVariable } from "./tracer";

export type Literal = number | string

export class Variable<T> {
  private _type: string;
  private _id: string | null;
  private _name: string | null;
  private _value: T;

  constructor(type: string, id: string | null, name: string | null, value: T) {
    this._type = type;
    this._id = id !== null ? `${id}` : null
    this._name = name
    this._value = value
  }

  get id() {
    return this._id !== null ? this._id : '';
  }

  get type() {
    return this._type;
  }

  get name() {
    return this._name !== null ? this._name : '';
  }

  get value() {
    return this._value;
  }

  public static create(obj: THeapVariable, id: string | null = null): Variable<any> | null {
    let type = '';
    let rest: any[] = []
    if (Array.isArray(obj)) {
      [type, ...rest] = obj;
    } else {
      type = 'LITERAL';
    }
    const name = id
    switch (type) {
      case 'LITERAL':
        return new LiteralVariable(id, name, obj as Literal);
      case 'SPECIAL_FLOAT':
        return new LiteralVariable(id, name, rest[0] as Literal);
      case 'REF':
        return new RefVariable(id, name, `${rest[0]}`);
      case 'FUNCTION':
        return new FunctionVariable(id, rest[0] as string);
      case 'LIST':
      case 'TUPLE':
      case 'SET':
        const values = this.createMany(rest)
        return type === 'LIST' 
          ? new ListVariable(id, name, values) 
          : type === 'TUPLE'
            ? new TupleVariable(id, name, values)
            : new SetVariable(id, name, values);
      case 'DICT':
      case 'CLASS':
        const dict: DictKeyValue[]  = []
        for (const [key, value] of rest) {
          const v = Variable.create(value)
          if (v) dict.push([new LiteralVariable(id, name, key), v]);
        }
        return type === 'DICT' 
          ? new DictVariable(id, name, dict)
            : new ClassVariable(id, name, dict)
      case 'INSTANCE':
        const instDict: DictKeyValue[]  = []
        const className = rest[0]
        for (const [key, value] of rest.slice(1)) {
          const v = Variable.create(value)
          if (v) instDict.push([new LiteralVariable(id, name, key), v]);
        }
        return new InstanceVariable(id, name, className, instDict);
      case 'IMPORTED_FAUX_PRIMITIVE':
        if (rest[0] === 'imported object') {
          return new FunctionVariable(id, id!);
        } else if (rest[0] === 'imported class') {
          return null;
        } else {
          console.warn('unknown imported faux primitive', rest[0])
          return null;
        }
      default:
        console.warn(`Not a valid type: ${type}(${name}): `, obj)
        return null;    
    }
  }

  public static createMany(objs: THeapVariable[]): ItemVariable[] {
    return objs.map((obj) => Variable.create(obj)).filter(obj => obj) as ItemVariable[];
  }
}

export class LiteralVariable extends Variable<Literal> {
  constructor(id: string | null, name: string | null, value: TLiteral) {
    super('LITERAL', id, name, value);
  }
}

export class RefVariable extends Variable<string> {
  constructor(id: string | null, name: string | null, value: string) {
    super('REF', id, name, value);
  }
}

export type ItemVariable = LiteralVariable | RefVariable

export class TupleVariable extends Variable<ItemVariable[]> {
  constructor(id: string | null, name: string | null, values: ItemVariable[]) {
    super('TUPLE', id, name, values);
  }
}

export class ListVariable extends Variable<ItemVariable[]> {
  constructor(id: string | null, name: string | null, values: ItemVariable[]) {
    super('LIST', id, name, values);
  }
}

export class SetVariable extends Variable<ItemVariable[]> {
  constructor(id: string | null, name: string | null, values: ItemVariable[]) {
    super('SET', id, name, values);
  }
}

export class FunctionVariable extends Variable<null> {
  constructor(id: string | null, name: string) {
    super('FUNCTION', id, name, null);
  }
}

export type DictKeyValue = [LiteralVariable, ItemVariable];
export class DictVariable extends Variable<DictKeyValue[]> {
  constructor(id: string | null, name: string | null, values: DictKeyValue[]) {
    super('DICT', id, name, values);
  }
}

export class ClassVariable extends Variable<DictKeyValue[]> {
  constructor(id: string | null, name: string | null, values: DictKeyValue[]) {
    super('CLASS', id, name, values);
  }
}

export class InstanceVariable extends Variable<DictKeyValue[]> {
  private _className: string
  constructor(id: string | null, name: string | null, className: string, values: DictKeyValue[]) {
    super('INSTANCE', id, name, values);
    this._className = className
  }

  get className() {
    return this._className
  }
}