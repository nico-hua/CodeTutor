import { Position } from "./ref"

export default class CanvasLayout {
  constructor(private layoutMap: Map<string, Position> = new Map()) {}

  copy() {
    return new CanvasLayout(new Map(this.layoutMap))
  }

  has(id: string) {
    return this.layoutMap.has(id)
  }

  get(id: string): Position {
    return this.layoutMap.get(id) || { x: 0, y: 0 }
  }

  set(id: string, position: Position) {
    this.layoutMap.set(id, position)
    return this
  }

  delete(id: string) {
    return this.layoutMap.delete(id)
  }
}