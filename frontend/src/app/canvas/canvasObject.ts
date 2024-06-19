import { Position } from "./ref";

export type TCanvasObjectPropsParam = {
  position?: Position;
  readonly?: boolean;
} 

export type TCanvasObjectProps = {
  position: Position;
  readonly: boolean;
} 

export const DefaultCanvasObjectProps: TCanvasObjectProps = {
  position: { x: 0, y: 0 },
  readonly: false
} 

export default class CanvasObject<T> {
  private _id: string;
  private _type: string;
  private _data: T;
  props: TCanvasObjectProps;
  constructor(id: string, type: string, _data: T, props?: TCanvasObjectPropsParam) {
    this._id = id
    this._type = type
    this._data = _data
    this.props = Object.assign({}, DefaultCanvasObjectProps, props)
  }
  
  get id() {
    return this._id
  }

  get type() {
    return this._type
  }

  get data() {
    return this._data
  }
}