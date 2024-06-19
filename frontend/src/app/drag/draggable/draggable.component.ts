import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChild } from '@angular/core';
import { DragService, Key, Size, TDragEndEvent, TDragEnterEvent, TDragItemEnterEvent, TDragItemInEvent, TDragItemLeaveEvent, TDragItemOutEvent, TDragItemOverEvent, TDragLeaveEvent, TDragOverEvent, TDragStartEvent, TDropEvent, TDropItemEvent } from '../drag.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-draggable',
  standalone: true,
  imports: [
    CommonModule
  ],
  providers: [DragService],
  templateUrl: './draggable.component.html',
  styleUrl: './draggable.component.scss'
})
export class DraggableComponent implements OnChanges, OnInit {
  @Input() draggable = true;
  @Input() dragSelector = '.drag'
  @Input() zIndex = 0;
  @Input() trigger: 'move' | 'drop' | 'none' = 'move';
  @Input() debug = false

  @Output() dragstart = new EventEmitter<TDragStartEvent>();
  @Output() dragend = new EventEmitter<TDragEndEvent>();
  @Output() dragover = new EventEmitter<TDragOverEvent>();
  @Output() itemDragover = new EventEmitter<TDragItemOverEvent>();
  @Output() itemDragEnter = new EventEmitter<TDragItemEnterEvent>();
  @Output() itemDragIn = new EventEmitter<TDragItemInEvent>();
  @Output() itemDragOut = new EventEmitter<TDragItemOutEvent>();
  @Output() itemDragLeave = new EventEmitter<TDragItemLeaveEvent>();
  @Output() itemDrop = new EventEmitter<TDropItemEvent>();
  @Output() dragenter = new EventEmitter<TDragEnterEvent>();
  @Output() dragleave = new EventEmitter<TDragLeaveEvent>();
  @Output() drop = new EventEmitter<TDropEvent>();
  @Output() resize = new EventEmitter<Size>();

  @ViewChild('containerRef') containerRef!: ElementRef<HTMLElement>;

  constructor(private dragService: DragService) {}

  get width() {
    return this.dragService.width;
  }

  get height() {
    return this.dragService.height;
  }

  getRect(key: Key) {
    return this.dragService.getRect(key);
  }

  get rect() {
    if (!this.containerRef) {
      console.warn('no ref')
      return {
        x: 0, y: 0, width: 0, height: 0
      };
    }
    const { left: x, top: y, width, height } = this.containerRef.nativeElement.getBoundingClientRect();
    return {
      x, y, width, height
    }
  }

  ngOnInit(): void {
    this.dragService.register(this)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['draggable']) {
      this.dragService.draggable = this.draggable;
    }
  }

  onDrop(event: DragEvent) {
  }

  onDragStart(event: DragEvent) {
  }

  onDragEnd(event: DragEvent) {
  }

  onDragEnter(event: DragEvent) {
    this.dragService.dragEnter(event)
  }

  onDragLeave(event: DragEvent) {
    this.dragService.dragLeave(event)
  }
}
