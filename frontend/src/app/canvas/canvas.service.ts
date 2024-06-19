import { Injectable } from '@angular/core';
import { CanvasComponent } from './canvas.component';
import CanvasObject from './canvasObject';
import { Position } from './ref';
import Emitteer from '../../utils/emitter';
import { CanvasObjectComponent } from './canvas-object/canvas-object.component';
import { intersect } from '../drag/drag.service';

export type TAddCanvasObjectEvent = {
  object: CanvasObject<any>;
}

export type TRemoveCanvasObjectEvent = {
  id: string
}

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  static Event = {
    ADD: 'add', 
    REMOVE: 'remove', 
  }

  readonly = false

  private canvas: CanvasComponent | null = null;
  private objectMap: Map<string, CanvasObjectComponent> = new Map()
  private childrenMap: Map<string, Set<string>> = new Map()
  private parentMap: Map<string, string> = new Map()
  private emitter: Emitteer = new Emitteer()
  constructor() { 
    this.onRemoveAny(({ component }) => {
      const { id } = component.object
      for (const child of this.getChildren(id)) {
        this.remove(child)
      }
      this.detach(id)
      this.objectMap.delete(id)
      this.childrenMap.delete(id)
    })
  }

  get rect() {
    return this.canvas?.rect || { x: 0, y: 0, width: 0, height: 0 }
  }

  private _uid = 0
  get uid() {
    return this._uid++
  }

  getRect(id: string) {
    return this.canvas?.getRect(id) || { x: 0, y: 0, width: 0, height: 0 }
  }

  getComponent(id: string) {
    return this.objectMap.get(id)
  }

  intersect(position: Position, radius: number = 5, include?: string[]) {
    const intersects: string[] = []
    if (!include) {
      include = [...this.objectMap.keys()]
    }
    for (const id of include) {
      const rect = this.getRect(id)
      if (intersect(rect, { ...position, width: radius, height: radius })) {
        intersects.push(id)
      }
    }
    return intersects
  }

  register(component: CanvasComponent | CanvasObjectComponent) {
    if (component instanceof CanvasComponent) {
      this.canvas = component
    } else {
      const { object } = component
      this.objectMap.set(object.id, component)
      this.emitter.notify(CanvasService.Event.ADD + object.id, { component })
      this.emitter.notify(CanvasService.Event.ADD , { component })
    }
    return this
  }

  unregister(component: CanvasComponent | CanvasObjectComponent) {
    if (component instanceof CanvasComponent) {
      this.canvas = null
    } else {
      const { object } = component
      this.objectMap.delete(object.id)
      this.emitter.notify(CanvasService.Event.REMOVE + object.id, { component })
      this.emitter.notify(CanvasService.Event.REMOVE, { component })
    }
    return this
  }

  add(object: CanvasObject<any>) {
    if (this.objectMap.has(object.id)) {
      // console.warn(`${object.id} has been existed`)
    } else {
      this.canvas?.addEmitter.emit({ object })
    }
    return this
  }

  remove(id: string) {
    this.canvas?.removeEmitter.emit({ id })
    return this
  }

  onAdd(id: string, cb: (arg: { component: CanvasObjectComponent }) => void) {
    this.emitter.once(CanvasService.Event.ADD + id, cb)
    return this
  }

  onAddAny(cb: (arg: { component: CanvasObjectComponent }) => void) {
    this.emitter.on(CanvasService.Event.ADD, cb)
    return this
  }

  offAddAny(cb: (arg: { component: CanvasObjectComponent }) => void) {
    this.emitter.off(CanvasService.Event.ADD, cb)
    return this
  }

  onRemove(id: string, cb: (arg: { component: CanvasObjectComponent }) => void) {
    return this.emitter.once(CanvasService.Event.REMOVE + id, cb)
  }

  onRemoveAny(cb: (arg: { component: CanvasObjectComponent }) => void) {
    this.emitter.on(CanvasService.Event.REMOVE, cb)
    return this
  }

  detach(id: string, ...children: string[]) {
    if (!children) {
      children = this.getChildren(id)
    }
    children.forEach(child => {
      this.childrenMap.get(id)?.delete(child)
      this.parentMap.delete(child)
    })
  }

  attach(id: string, ...children: CanvasObject<any>[]) {
    if (!this.childrenMap.has(id)) {
      this.childrenMap.set(id, new Set())
    }
    children.forEach(child => {
      this.parentMap.set(child.id, id)
      this.childrenMap.get(id)?.add(child.id)
    })
  }

  getParent(id: string) {
    return this.parentMap.get(id)
  }

  getChildren(id: string) {
    return Array.from(this.childrenMap.get(id) || new Set<string>())
  }

  render(autolayout = false) {
    this.canvas?.render(autolayout)
  }

  private draggingId: string | null = null
  dragItemStart(id: string) {
    this.draggingId = id
  }

  dragItemEnd() {
    this.draggingId = null
    if (this.isEntering) {
      this.onEnterEnd([])
    }
  }
  
  private isRemoving = false
  private calcOutArea({ x, y }: Position) {
    const id = String(this.draggingId!)
    const { width, height } = this.getRect(id)
    let outArea = 0
    if (x < 0) outArea += -x * height
    if (y < 0) outArea += -y * width
    if (x < 0 && y < 0) outArea += x * y
    return outArea
  }
  dragItemOver(position: Position) {
    // todo
    if (this.calcOutArea(position) > 1e-5) {
      this.isRemoving = true
    } else {
      this.isRemoving = false
    }
    
    this.render(false)
  }

  dropItem(tgts: string[]) {
    if (this.isRemoving) {
      this.canvas?.removeEmitter.emit({ id: this.draggingId! })
    } 
    if (this.isEntering) {
      this.onEnterEnd(tgts)
    }
    this.isRemoving = false
    this.draggingId = null
  }

  isEntering = false
  private enterCallback: ((tgs: string[]) => void) | null = null
  private isEnterable: (obj: any) => boolean = () => true 
  private DefaultEnterOption: {
    isEnterable?: (obj: any) => boolean;
  } = {
    isEnterable: () => true
  } 
  onEnter(callback: (tgs: string[]) => void, option?: typeof this.DefaultEnterOption) {
    const { isEnterable } = Object.assign({}, this.DefaultEnterOption, option)
    this.enterCallback = callback
    this.isEnterable = isEnterable!
    this.isEntering = true
  }

  onEnterEnd(tgts: string[]) {
    this.isEntering = false
    this.enterCallback!(tgts.filter(id => this.objectMap.has(id) && this.isEnterable(this.objectMap.get(id)!.value)))
    this.enterCallback = null
  }


  isSelecting = false
  private selected: Set<string> = new Set()
  private selectedOrder: string[] = []
  private selectNum = 1
  private selectCallback: ((selected: Set<any>) => void) | null = null
  private isSelectable: (obj: any) => boolean = () => true 
  private DefaultSelectOption: {
    selectNum?: number;
    selected?: Set<string>; 
    isSelectable?: (obj: any) => boolean;
  } = {
    selectNum: 1,
    selected: new Set(), 
    isSelectable: () => true
  } 
  onSelect(callback: (selected: Set<any>) => void, option?: typeof this.DefaultSelectOption) {
    const { selected, selectNum, isSelectable } = Object.assign({}, this.DefaultSelectOption, option)
    this.readonly = true
    this.isSelecting = true
    this.selectNum = selectNum!
    this.selected.clear()
    this.selectedOrder = []
    this.isSelectable = isSelectable!
    this.selectCallback = callback
    window.addEventListener('click', this.onSelectEnd_b)
    this.select(selected!)
  }

  onSelectEnd() {
    this.readonly = false
    this.selectCallback!(new Set(Array.from(this.selected).map(id => this.objectMap.get(id)!.value)))
    this.selected.clear()
    this.selectedOrder = []
    this.isSelecting = false
    window.removeEventListener('click', this.onSelectEnd_b)
  }
  onSelectEnd_b = this.onSelectEnd.bind(this)

  select(ids: Set<string>) {
    if (!this.isSelecting) return
    ids.forEach(id => {
      if (this.objectMap.has(id) && this.isSelectable(this.objectMap.get(id)!.value)) {
        if (this.selected.has(id)) {
          this.selected.delete(id)
          this.selectedOrder.splice(this.selectedOrder.indexOf(id), 1)
        } else {
          this.selected.add(id)
          this.selectedOrder.push(id)
          if (this.selected.size > this.selectNum) {
            this.selected.delete(this.selectedOrder.shift()!)
          }
        }
      }
    })
  }

  getItemStyle(id: string) {
    if (id === this.draggingId) {
      if (this.isRemoving) {
        return {
          backgroundColor: 'red',
          boxShadow: '0 0 10px 2px red',
          opacity: 0.5,
        }
      }
      return { 
        boxShadow: '0 0 10px 2px rgba(0, 128, 255, 0.3)',
      }
    } else if (this.objectMap.has(id)) {
      if(this.isSelecting) {
        if (!this.isSelectable(this.objectMap.get(id)!.value)) {
          return {
            cursor: 'not-allowed',
            backgroundColor: 'black',
            opacity: 0.3,
          }
        } else {
          const style: Record<string, string> = {
            cursor: 'pointer',
          }
          if (this.selected.has(id)) {
            style['boxShadow'] = '0 0 10px 2px rgba(0, 128, 255, 0.8)'
          }
          return style
        } 
      } else if (this.isEntering) {
        if (!this.isEnterable(this.objectMap.get(id)!.value)) {
          return {
            backgroundColor: 'transparent',
            opacity: 0.3,
          }
        } else {
          return {
            boxShadow: '0 0 10px 2px rgba(0, 255, 128, 0.3)',
          }
        }
      }
    }
    return {}
  }
}
