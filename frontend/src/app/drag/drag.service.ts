import { Injectable } from '@angular/core';
import { DraggableItemComponent } from './draggable-item/draggable-item.component';
import { DraggableComponent } from './draggable/draggable.component';
import Emitter from '../../utils/emitter';

export type Key = string | number | symbol;

export type Position = {
  x: number;
  y: number;
}

export type Size = {
  width: number;
  height: number;
}

export type Rect = Size & Position

export function intersect(r1: Rect, r2: Rect) {
  const left1 = r1.x;
  const right1 = r1.x + r1.width;
  const top1 = r1.y;
  const bottom1 = r1.y + r1.height;
  const left2 = r2.x;
  const right2 = r2.x + r2.width;
  const top2 = r2.y;
  const bottom2 = r2.y + r2.height;

  return !(right1 < left2 || right2 < left1 || bottom1 < top2 || bottom2 < top1);
}

export function calcArea(r1: Rect, r2: Rect) {
  if (!intersect(r1, r2)) {
    return 0;
  }
  
  const x1 = Math.max(r1.x, r2.x);
  const y1 = Math.max(r1.y, r2.y);
  const x2 = Math.min(r1.x + r1.width, r2.x + r2.width);
  const y2 = Math.min(r1.y + r1.height, r2.y + r2.height);

  return (x2 - x1) * (y2 - y1);
}

export type TDragEvent = {
  raw: DragEvent
}
export type TDragStartEvent = {
  key: Key;
} & TDragEvent
export type TDragEndEvent = {
  key: Key;
} & TDragEvent
export type TDragEnterEvent = {} & TDragEvent
export type TDragLeaveEvent = {} & TDragEvent
export type TDragOverEvent = {
  position: Position;
} & TDragEvent
export type TDragItemOverEvent = {
  position: Position;
} & TDragEvent
export type TDragItemEnterEvent = {
  src: Key;
  tgts: Key[];
} & TDragEvent
export type TDragItemInEvent = {
  src: Key;
  tgts: Key[];
} & TDragEvent
export type TDragItemOutEvent = {
  src: Key;
  tgts: Key[];
} & TDragEvent
export type TDragItemLeaveEvent = {
  src: Key;
  tgts: Key[]
} & TDragEvent
export type TDropItemEvent = {
  src: Key;
  tgts: Key[],
  position: Position;
} & TDragEvent
export type TDropEvent = {
  position: Position;
} & TDragEvent

@Injectable({
  providedIn: 'root'
})
export class DragService {
  private static DragState = {
    NONE: 'none',
    DRAGGING: 'dragging',
    DRAGGING_IN: 'draggingIn',
  }

  static DragEvent = {
    UPDATE: Symbol('update'),
  }

  private _draggable = false
  
  private emitter = new Emitter()
  private itemMap = new Map<Key, DraggableItemComponent>()
  private context: DraggableComponent | null = null
  private parentMap = new Map<Key, Key>()
  private item: DraggableItemComponent | null = null
  private itemState = { zIndex: 0 }
  // 鼠标与被拖拽元素的左上角的偏移
  private offset: Position = { x: 0, y : 0 }
  private state = DragService.DragState.NONE
  private w: number = 0;
  private h: number = 0;
  private timer: any = null
  private itemsToUpdate: DraggableItemComponent[] = []
  private targetSet: Set<EventTarget> = new Set();
  private intersects: Set<Key> = new Set();
  private contains: Set<Key> = new Set();

  get width() {
    return this.w
  }

  get height() {
    return this.h
  }

  get draggable() {
    return this._draggable
  }

  getRect(key: Key) {
    return this.itemMap.get(key)?.rect ?? { x: 0, y: 0, width: 0, height: 0 }
  }

  isParent(key1: Key, key2: Key) {
    let key: Key | undefined = key1
    do {
      key = this.parentMap.get(key)
    } while (key && key !== key2)
    return key === key2
  }

  /**
   * 
   * @param key item的key
   * @param position 相对于整个draggable区域的坐标
   * @returns 相对于最近定位元素的坐标
   */
  calcItemPos(key: Key, position: Position) {
    let { x, y } = position
    const { x: x0, y: y0 } = this.context?.rect || { x: 0, y: 0 }
    const element = this.itemMap.get(key)?.containerRef.nativeElement.parentElement?.parentElement || null;
    let currentNode = element;
    while (
      currentNode && 
      !currentNode.classList.contains('draggable')
    ) {
        const computedStyle = window.getComputedStyle(currentNode);
        const position = computedStyle.getPropertyValue('position')
        if (position === 'relative' || position === 'absolute') {
          const { x: x1, y: y1 } = currentNode.getBoundingClientRect()
          x -= x1 - x0
          y -= y1 - y0
          break
        }
        currentNode = currentNode.parentElement;
    }
    return { x, y }
  }

  updateDraggable(item: DraggableItemComponent, value: boolean) {
    const el = item.containerRef.nativeElement.querySelector(this.context?.dragSelector || '.drag-icon') as HTMLElement ?? item.containerRef.nativeElement
    el.draggable = value
    el.style.cursor = value ? 'move' : 'default'
  }

  set draggable(value: boolean) {
    this._draggable = value
    this.itemMap.forEach((item) => this.updateDraggable(item, value))
  }

  resize(items: Iterable<DraggableItemComponent> | null = null) {
    if (items === null) {
      items = this.itemMap.values()
    }
    let w = 0
    let h = 0
    for (const item of items) {
      const { width, height } = item.rect
      const { x, y } = item.pos
      w = Math.max(w, x + width)
      h = Math.max(h, y + height)
      if (w > this.w || h > this.h) {
        this.w = Math.max(this.w, w)
        this.h = Math.max(this.h, h)
        this.context?.resize.emit({ width: this.w, height: this.h })
      }
    }
  }

  on(event: string | symbol, callback: Function) {
    this.emitter.on(event, callback)
    return this
  }

  onUpdate(cb: (arg: { key: Key, position: Position }) => void, key?: Key) {
    if (key) {
      this.emitter.on(String(DragService.DragEvent.UPDATE) + String(key), cb)
    } else {
      this.emitter.on(DragService.DragEvent.UPDATE, cb)
    }
  }

  offUpdate(cb: (arg: { key: Key, position: Position }) => void, key?: Key) {
    if (key) {
      this.emitter.off(String(DragService.DragEvent.UPDATE) + String(key), cb)
    } else {
      this.emitter.off(DragService.DragEvent.UPDATE, cb)
    }
  }

  off(event: string | symbol, callback: Function) {
    this.emitter.off(event, callback)
    return this
  }

  notify(event: string | symbol, ...args: any[]) {
    this.emitter.notify(event, ...args)
    return this
  }

  constructor() { }

  register(item: DraggableItemComponent | DraggableComponent) {
    if (item instanceof DraggableItemComponent) {
      this.itemMap.set(item.key, item)
      const element = item.containerRef.nativeElement.parentElement?.parentElement || null;
      let currentNode = element;
      // todo 遍历寻找最近祖先
      while (
        currentNode && 
        currentNode.tagName.toLowerCase() !== 'app-draggable' && 
        currentNode.tagName.toLowerCase() !== 'app-draggable-item'
      ) {
        currentNode = currentNode.parentElement;
      }
      if (currentNode && currentNode.tagName.toLowerCase() === 'app-draggable-item') {
        const key = currentNode.getAttribute('ng-reflect-key') as Key;
        this.parentMap.set(item.key, key)
      }
      this.updateDraggable(item, this.draggable)
      this.toResize(item)
    } else {
      this.context = item
    }
  }

  unregister(item: DraggableItemComponent) {
    this.itemMap.delete(item.key)
  }

  toResize(item: DraggableItemComponent) {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.itemsToUpdate.push(item)
    }
    this.timer = setTimeout(() => {
      this.resize(this.itemsToUpdate)
      this.itemsToUpdate.length = 0
    })
  }

  onDragOver(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    const { clientX, clientY } = event
    const { x, y } = this.context!.rect;

    const position = {
      x: clientX - x, 
      y: clientY - y
    }
    this.dragOver(event, position)
  }
  onDragOver_b = this.onDragOver.bind(this)

  onDrop(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.drop(event)
  }
  onDrop_b = this.onDrop.bind(this)

  addDragOverListener() {
    window.addEventListener('dragover', this.onDragOver_b, true);
  }

  removeDragOverListener() {
    window.removeEventListener('dragover', this.onDragOver_b, true);
  }

  addDropListener() {
    window.addEventListener('drop', this.onDrop_b, true);
  }

  removeDropListener() {
    window.removeEventListener('drop', this.onDrop_b, true);
  }

  begin(item: DraggableItemComponent) {
    this.item = item
    item.dragging = true
    this.itemState.zIndex = item.zIndex
    // todo z-index manage
    item.zIndex = 100
    // 去除文字选定
    document.getElementsByTagName('body')[0].style.userSelect = 'none'
      
    this.addDragOverListener()
    this.addDropListener()
  }

  end() {
    const { key, pos: position } = this.item!
    this.notify(DragService.DragEvent.UPDATE, { key, position })
    this.notify(String(DragService.DragEvent.UPDATE) + String(key), { key, position })
    this.item!.dragging = false
    this.item!.zIndex = this.itemState.zIndex
    this.item = null
    this.intersects.clear()
    this.contains.clear()

    document.getElementsByTagName('body')[0].style.userSelect = 'auto'
    this.removeDragOverListener()
    this.removeDropListener()
  }

  dragItemStart(event: DragEvent, item: DraggableItemComponent) {
    if (this.state === DragService.DragState.NONE) {
      this.begin(item)
      
      this.state = DragService.DragState.DRAGGING
  
      const { clientX, clientY } = event
      const { x, y } = item.rect
      this.offset = {
        x: clientX - x,
        y: clientY - y
      }
      // 自定义图像，可去除残影
      if (this.context?.trigger === 'move') {
        event.dataTransfer!.setDragImage(document.createElement('div'), 0, 0);
      }
      
      this.context?.dragstart.emit({ raw: event, key: item.key });
    } else if (this.context?.debug) {
      console.warn(`dragStart called when state is ${this.state}`)
    }
  }

  dragItemEnd(event: DragEvent) {
    if (this.state === DragService.DragState.DRAGGING) {
      this.state = DragService.DragState.NONE
      const { key } = this.item!

      this.end()
      
      this.context?.dragend.emit({ raw: event, key });
    } else if (this.context?.debug) {
      console.warn(`dragEnd called when state is ${this.state}`)
    }
  }

  dragItemOver(event: DragEvent, position: Position) {
    if (!this.item) {
      console.warn('No item being dragged!')
      return
    }
    const { x, y } = position
    const { x: x0, y: y0 } = this.context!.rect
    const { x: dx, y: dy } = this.offset
    const pos = {
      x: x - dx,
      y: y - dy
    }
    const { key } = this.item
    const { width, height } = this.item.rect
    const enterTgts = []
    const inTgts = []
    const outTgts = []
    const leaveTgts = []
    for (const item of this.itemMap.values()) {
      const { key: key1 } = item
      if (
        key !== key1 
        && !this.isParent(key, key1)
        && !this.isParent(key1, key)
      ) {
        const { x: x1, y: y1, width: w1, height: h1 } = item.rect
        const area = calcArea({ ...pos, width, height }, { x: x1 - x0, y: y1 - y0, width: w1, height: h1 })
        if (area > 0) {
          if (!this.intersects.has(key1)) {
            this.intersects.add(key1)
            enterTgts.push(key1)
          }
          const totalArea = Math.min(width * height, w1 * h1)
          if (area > Math.min(2000, 0.5 * totalArea)  && !this.contains.has(key1)) {
            this.contains.add(key1)
            inTgts.push(key1)
          }
          if (area < Math.min(2000, 0.5 * totalArea) && this.contains.has(key1)) {
            this.contains.delete(key1)
            outTgts.push(key1)
          }
        } else {
          if (this.intersects.has(key1)) {
            this.intersects.delete(key1)
            leaveTgts.push(key1)
          }
        }
      }
    }
    for (const tgts of [ enterTgts, inTgts, outTgts, leaveTgts ]) {
      // sort as zIndex descending
      tgts.sort((t1, t2) => this.itemMap.get(t2)!.zIndex - this.itemMap.get(t1)!.zIndex)
    }
    if (enterTgts.length > 0) {
      this.context?.itemDragEnter.emit({ raw: event, src: key, tgts: enterTgts })
    }
    if (inTgts.length > 0) {
      this.context?.itemDragIn.emit({ raw: event, src: key, tgts: inTgts })
    }
    if (outTgts.length > 0) {
      this.context?.itemDragOut.emit({ raw: event, src: key, tgts: outTgts })
    }
    if (leaveTgts.length > 0) {
      this.context?.itemDragLeave.emit({ raw: event, src: key, tgts: leaveTgts })
    }
    if (this.context?.trigger === 'move') {
      this.item!.pos = this.calcItemPos(key, pos)
      this.toResize(this.item!)
    }
    this.context?.itemDragover.emit({ raw: event, position })
  }

  dragOver(event: DragEvent, position: Position) {
    if (this.state === DragService.DragState.DRAGGING) {
      this.dragItemOver(event, position)
    } else if (this.state === DragService.DragState.DRAGGING_IN) {
      this.context?.dragover.emit({ raw: event, position })
    } else if (this.context?.debug) {
      console.warn(`draging over but state is ${this.state}`)
    }
  }

  dragEnter(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (this.state === DragService.DragState.NONE) {
      if (this.targetSet.size === 0) {
        this.state = DragService.DragState.DRAGGING_IN
        this.addDragOverListener()
        this.addDropListener()
        this.context?.dragenter.emit({ raw: event })
      } 
      this.targetSet.add(event.target!);
    } else if (this.state === DragService.DragState.DRAGGING_IN) {
      this.targetSet.add(event.target!)
    } else if (this.context?.debug) {
      console.warn(`dragEnter called when state is ${this.state}`)
    }
  }

  dragLeave(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (this.state === DragService.DragState.DRAGGING_IN) {
      this.targetSet.delete(event.target!);
      if (this.targetSet.size === 0) {
        this.state = DragService.DragState.NONE
        this.context?.dragleave.emit({ raw: event })
        this.removeDragOverListener()
        this.removeDropListener()
      }
    } else if (this.context?.debug) {
      console.warn(`dragLeave called when state is ${this.state}`)
    }
  }

  drop(event: DragEvent) {
    const { left: x, top: y } = this.context!.containerRef.nativeElement.getBoundingClientRect();
    const { clientX, clientY } = event
    const position = { x: clientX - x, y: clientY - y }
    if (this.state === DragService.DragState.DRAGGING_IN) {
      this.state = DragService.DragState.NONE
      this.context?.drop.emit({ position, raw: event })
      this.targetSet.clear()
      this.removeDragOverListener()
      this.removeDropListener()
    } if (this.state === DragService.DragState.DRAGGING) {
      this.state = DragService.DragState.NONE
      this.context?.itemDrop.emit({
        raw: event,
        src: this.item!.key,
        tgts: Array.from(this.contains),
        position,
      })
      this.end()
    } else if (this.context?.debug) {
      console.warn(`drop called when state is ${this.state}`)
    }
  }
}
