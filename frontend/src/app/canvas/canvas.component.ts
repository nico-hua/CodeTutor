import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { buildGraph } from './canvasGraph';
import { CanvasObjectComponent } from './canvas-object/canvas-object.component';
import CanvasObject from './canvasObject';
import { CommonModule } from '@angular/common';
import { DraggableComponent } from '../drag/draggable/draggable.component';
import { DraggableItemComponent } from '../drag/draggable-item/draggable-item.component';
import CanvasLayout from './canvasLayout';
import { Size, TDragEndEvent, TDragEnterEvent, TDragEvent, TDragItemEnterEvent, TDragItemInEvent, TDragItemLeaveEvent, TDragItemOutEvent, TDragItemOverEvent, TDragLeaveEvent, TDragOverEvent, TDragStartEvent, TDropEvent, TDropItemEvent } from '../drag/drag.service';
import { CanvasService, TAddCanvasObjectEvent, TRemoveCanvasObjectEvent } from './canvas.service';
import { Slots } from './ref';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [
    CommonModule,
    CanvasObjectComponent,
    DraggableComponent,
    DraggableItemComponent
  ],
  providers: [CanvasService],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss'
})
export class CanvasComponent implements OnChanges, OnInit, OnDestroy {
  @Input() maxWidth: number = Number.MAX_VALUE;
  // todo: max height is useless now
  @Input() maxHeight: number = Number.MAX_VALUE;
  @Input() minWidth: number = 640;
  @Input() minHeight: number = 480;
  @Input() zIndex: number = 0;
  
  @Input() objects!: CanvasObject<any>[];
  @Input('layout') initLayout: CanvasLayout | null = null
  @Input('autolayout') isAutolayout = true
  @Input() draggable: boolean = false

  @Output('layout') layoutEmitter = new EventEmitter<CanvasLayout>()
  @Output('resize') resizeEmitter = new EventEmitter<Size>()
  @Output('dragenter') dragEnterEmitter = new EventEmitter<TDragEnterEvent>()
  @Output('dragleave') dragLeaveEmitter = new EventEmitter<TDragLeaveEvent>()
  @Output('dragover') dragOverEmitter = new EventEmitter<TDragOverEvent>()
  @Output('drop') dropEmitter = new EventEmitter<TDropEvent>()
  @Output('itemDragStart') itemDragStartEmitter = new EventEmitter<TDragStartEvent>()
  @Output('itemDragEnd') itemDragEndEmitter = new EventEmitter<TDragEndEvent>()
  @Output('itemDragEnter') itemDragEnterEmitter = new EventEmitter<TDragItemEnterEvent>()
  @Output('itemDragLeave') itemDragLeaveEmitter = new EventEmitter<TDragItemLeaveEvent>()
  @Output('itemDragIn') itemDragInEmitter = new EventEmitter<TDragItemInEvent>()
  @Output('itemDragOut') itemDragOutEmitter = new EventEmitter<TDragItemOutEvent>()
  @Output('itemDrop') itemDropEmitter = new EventEmitter<TDropItemEvent>()

  @Output('add') addEmitter = new EventEmitter<TAddCanvasObjectEvent>()
  @Output('remove') removeEmitter = new EventEmitter<TRemoveCanvasObjectEvent>()

  @ViewChild('container') container!: ElementRef<HTMLElement>;
  @ViewChild('draggableRef') draggableRef!: DraggableComponent;
  @ViewChildren(CanvasObjectComponent) objectRefs!: QueryList<CanvasObjectComponent>;
  
  paths: string[] = []
  layout: CanvasLayout | null = null

  constructor(public canvasService: CanvasService) {}

  get width() {
    return Math.max(this.draggableRef?.width || 0, this.minWidth)
  }

  get height() {
    return Math.max(this.draggableRef?.height || 0, this.minHeight)
  }

  get rect() {
    const { left: x, top: y } = this.container.nativeElement.getBoundingClientRect()
    return { x, y, width: this.width, height: this.height }
  }

  get readonly() {
    return this.canvasService.readonly
  }

  get isSelecting() {
    return this.canvasService.isSelecting
  }

  getItemStyle(id: string) {
    return this.canvasService.getItemStyle(id)
  }

  getInitPosition(id: string) {
    let pos = { x: 0, y: 0 }
    if (this.layout && this.layout.has(id)) {
      pos = this.layout.get(id)!
    }
    return pos
  }

  getRect(id: string) {
    return this.draggableRef.getRect(id)
  }

  buildGraph() {
    const slots: Slots = { inputs: [], outputs: [] }

    this.objectRefs.forEach(obj => {
      const { inputs, outputs } = obj.getSlots()
      slots.inputs.push(...inputs)
      slots.outputs.push(...outputs)
    })

    return buildGraph(slots)
  }

  autolayout() {
    const { maxWidth } = this
    const { left: x, top: y } = this.container.nativeElement.getBoundingClientRect()
    const base = { x, y }
    this.layout = this.buildGraph().link().layout({
      maxWidth,
    })
    this.layoutEmitter.emit(this.layout)
    setTimeout(() => {
      this.paths = this.buildGraph().link().calc({ base })
    })
  }

  render(isAutolayout = this.isAutolayout) {
    if (!this.container.nativeElement) {
      console.warn('render before view initialized')
      return
    } 
    const { left: x, top: y } = this.container.nativeElement.getBoundingClientRect()
    const base = { x, y }
    
    if (isAutolayout) {
      // todo 为了保证渲染完成，调用两次
      this.autolayout()
      setTimeout(() => this.autolayout())
    } else {
      this.paths = this.buildGraph().link().calc({ base })
    }
  }

  render_b = this.render.bind(this, false)

  ngOnInit(): void {
    this.canvasService.register(this)
    window.addEventListener('resize', this.render_b)
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.render_b)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['objects']
    ) {
      setTimeout(() => this.render())
    }

    if (
      changes['initLayout'] && changes['initLayout'].currentValue !== null
    ) {
      this.layout = changes['initLayout'].currentValue
      setTimeout(() => this.render(false))
    }
  }

  onResize(size: Size) {
    if (size.width < this.minWidth) {
      size.width = this.minWidth
    }
    if (size.height < this.minHeight) {
      size.height = this.minHeight
    }
    this.resizeEmitter.emit(size)
  }

  onDragItemStart(event: TDragStartEvent) {
    this.canvasService.dragItemStart(String(event.key))
    this.itemDragStartEmitter.emit(event)
  }

  onDragItemEnd(event: TDragEndEvent) {
    this.canvasService.dragItemEnd()
    this.itemDragStartEmitter.emit(event)
  }

  onDragItemOver({ position }: TDragItemOverEvent) {
    this.canvasService.dragItemOver(position)
  }

  onDropItem(event: TDropItemEvent) {
    this.canvasService.dropItem(event.tgts.map(tgt => String(tgt)))
    this.itemDropEmitter.emit(event)
  }

  onDragItemEnter(event: TDragItemEnterEvent) {
    this.itemDragEnterEmitter.emit(event)
  }

  onDragItemIn(event: TDragItemInEvent) {
    this.itemDragInEmitter.emit(event)
  }

  onDragItemOut(event: TDragItemOutEvent) {
    this.itemDragOutEmitter.emit(event)
  }

  onDragItemLeave(event: TDragItemLeaveEvent) {
    this.itemDragLeaveEmitter.emit(event)
  }

  handleRaw(event: TDragEvent | DragEvent) {
    if (this.readonly) return false
    let raw: DragEvent;
    if (event instanceof DragEvent) {
      raw = event
    } else {
      raw = event.raw
    }
    raw.preventDefault()
    raw.stopPropagation()
    return !(event instanceof DragEvent)
  }

  onDragOver(event: TDragOverEvent | DragEvent) {
    if (this.handleRaw(event)) {
      this.dragOverEmitter.emit(event as TDragOverEvent)
    }
  }

  onDragEnter(event: TDragEnterEvent | DragEvent) {
    if (this.handleRaw(event)) {
      this.dragEnterEmitter.emit(event as TDragEnterEvent)
    }
  }

  onDragLeave(event: TDragLeaveEvent | DragEvent) {
    if (this.handleRaw(event)) {
      this.dragLeaveEmitter.emit(event as TDragLeaveEvent)
    }
  }

  onDrop(event: TDropEvent | DragEvent) {
    if (this.handleRaw(event)) {
      this.dropEmitter.emit(event as TDropEvent)
    }
  }

  onClick(event: MouseEvent, id: string) {
    this.canvasService.select(new Set([id]))
  }
}
