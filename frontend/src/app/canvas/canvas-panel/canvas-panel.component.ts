import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DraggableComponent } from '../../drag/draggable/draggable.component';
import { DraggableItemComponent } from '../../drag/draggable-item/draggable-item.component';
import { Size, TDragEndEvent, TDragStartEvent } from '../../drag/drag.service';

export type TCanvasPanelItem = {
  id: string;
  name: string;
}

export type TPanelDragStartEvent = {
  raw: DragEvent;
  id: string;
  type: string;
}

export type TPanelDragEndEvent = TPanelDragStartEvent

export type TItems = Record<string, TCanvasPanelItem[]>

@Component({
  selector: 'app-canvas-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    DraggableComponent,
    DraggableItemComponent,
  ],
  templateUrl: './canvas-panel.component.html',
  styleUrl: './canvas-panel.component.scss'
})
export class CanvasPanelComponent {
  @Input() items: TItems = {}
  @Input() itemGroupInfos: { id: keyof TItems, name: string }[] = []

  @Output() dragstart = new EventEmitter<TPanelDragStartEvent>()
  @Output() dragend = new EventEmitter<TPanelDragEndEvent>()

  itemWidth = 100
  itemHeight = 100

  line_num = 3
  getPosition(item: TCanvasPanelItem, card: number, i: number) {
    return {
      x: i % this.line_num * this.itemWidth,
      y: Math.floor(i / this.line_num) * this.itemHeight
    }
  }

  getCardSize(key: string, card: number) {
    return this.items[key].reduce(
      (size, item, i) => {
        const { width, height } = this.getItemSize(item, card, i)
        return {
          width: size.width + (i < this.line_num ? width : 0),
          height: size.height + (i % this.line_num === 0 ? height : 0),
        }
      },
      {
        width: 0,
        height: 0,
      }
    )
  }

  getItemSize(item: TCanvasPanelItem, card: number, i: number) {
    return {
      width: this.itemWidth,
      height: this.itemHeight
    }
  }

  toStyle(size: Size) {
    return {
      width: `${size.width}px`,
      height: `${size.height}px`
    }
  }

  keys(o: any) {
    return Object.keys(o)
  }

  onDragStart(event: TDragStartEvent, type: string) {
    const { key, raw } = event
    this.dragstart.emit({  id: String(key), type, raw })
  }

  onDragEnd(event: TDragEndEvent, type: string) {
    const { key, raw } = event
    this.dragend.emit({  id: String(key), type, raw })
  }
}
