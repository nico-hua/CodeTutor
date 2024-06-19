import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DragService, Key } from '../drag.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-draggable-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './draggable-item.component.html',
  styleUrl: './draggable-item.component.scss'
})
export class DraggableItemComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() key!: Key;
  @Input() initialPosition: { x: number, y: number } = { x: 0, y: 0 };

  @ViewChild('containerRef') containerRef!: ElementRef<HTMLElement>;

  zIndex = 0
  pos = { x: 0, y: 0 };
  dragging = false
  constructor(private dragService: DragService, public elementRef: ElementRef) {}
  
  ngOnInit(): void {
    if (this.key === undefined) {
      console.warn('key is undefined')
    }
  }

  ngAfterViewInit(): void {
    this.dragService.register(this)
  }

  ngOnDestroy(): void {
    this.dragService.unregister(this)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialPosition']) {
      this.pos = this.initialPosition;
      this.dragService.toResize(this)
    }
  }

  get draggable() {
    return this.dragService.draggable
  }

  get position() {
    return {
      left: `${this.pos.x}px`,
      top: `${this.pos.y}px`
    }
  }

  get style() {
    const { zIndex, position } = this
    return { zIndex, ...position }
  }

  get rect() {
    if (!this.containerRef) {
      console.warn('no ref', this.key)
      return {
        x: 0, y: 0, width: 0, height: 0
      };
    }
    const { left: x, top: y, width, height } = this.containerRef.nativeElement.getBoundingClientRect();
    return {
      x, y, width, height
    }
  }

  onDragStart(event: DragEvent) {
    event.stopPropagation()
    this.dragService.dragItemStart(event, this)
  }

  onDragEnd(event: DragEvent) {
    event.stopPropagation()
    this.dragService.dragItemEnd(event)
  }

  onDrop(event: DragEvent) {
  }
}
