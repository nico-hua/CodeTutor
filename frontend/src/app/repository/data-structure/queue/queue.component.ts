import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Slots } from '../../../canvas/ref';
import { CellComponent } from '../cell/cell.component';
import { IDataStructureComponent } from '../data-structure.component';
import { QueueObject } from '../../../../object/data-structure/queue';
import { CanvasService } from '../../../canvas/canvas.service';
import CanvasObject from '../../../canvas/canvasObject';
import { LiteralObject } from '../../../../object/data-structure/literal';

@Component({
  selector: 'app-queue',
  standalone: true,
  imports: [CommonModule, CellComponent],
  templateUrl: './queue.component.html',
  styleUrl: './queue.component.scss',
})
export class QueueComponent implements IDataStructureComponent, OnChanges {
  @Input('value') initQueue!: QueueObject<any>;
  @Input('readonly') readonly!: boolean;
  @Input('animate') animate: boolean = false;

  @Output('change') changeEmitter = new EventEmitter<QueueObject<any>>();

  @ViewChild('containerRef') containerRef!: ElementRef<HTMLDivElement>;

  curEdit = -1;

  queue!: QueueObject<any>;

  styleMap: Map<number, Record<string, string>> = new Map();

  constructor(private canvasService: CanvasService) {}

  style(i: number) {
    return this.styleMap.get(i) || {};
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initQueue']) {
      this.queue = this.initQueue
        .on(QueueObject.Event.GET, this.onQueueGet_b)
        .on(QueueObject.Event.UPDATE, this.onQueueUpdate_b)
        .on(QueueObject.Event.ADD, this.onQueueAdd_b)
        .on(QueueObject.Event.REMOVE, this.onQueueRemove_b)
        .on(QueueObject.Event.SWAP, this.onQueueSwap_b);

      changes['initQueue'].previousValue
        ?.off(QueueObject.Event.GET, this.onQueueGet_b)
        .off(QueueObject.Event.UPDATE, this.onQueueUpdate_b)
        .off(QueueObject.Event.ADD, this.onQueueAdd_b)
        .off(QueueObject.Event.REMOVE, this.onQueueRemove_b)
        .off(QueueObject.Event.SWAP, this.onQueueSwap_b);

      this.changeEmitter.emit(this.queue);
    }
  }

  onQueueGet(i: number, v: any) {
    if (this.animate) {
      this.styleMap.set(i, { backgroundColor: 'red', color: 'white' });
      setTimeout(() => {
        this.styleMap.delete(i);
      }, 1000);
    }
  }
  onQueueGet_b = this.onQueueGet.bind(this);

  onQueueUpdate(i: number, v: any, vold: any) {
    if (this.animate) {
      // todo
    }
  }
  onQueueUpdate_b = this.onQueueUpdate.bind(this);

  onQueueAdd(i: number, ...vs: any[]) {
    if (this.animate) {
      for (let j = i; j < i + vs.length; j++) {
        this.styleMap.set(j, { color: 'red' });
      }
      setTimeout(() => {
        for (let j = i; j < i + vs.length; j++) {
          this.styleMap.delete(j);
        }
      }, 1000);
    }
  }
  onQueueAdd_b = this.onQueueAdd.bind(this);

  onQueueRemove(i: number, ...vs: any[]) {
    if (this.animate) {
      // todo
    }
  }
  onQueueRemove_b = this.onQueueRemove.bind(this);

  onQueueSwap(i: number, j: number, vi: any, vj: any) {
    if (this.animate) {
      this.styleMap.set(i, { backgroundColor: 'green', color: 'white' });
      this.styleMap.set(j, { backgroundColor: 'green', color: 'white' });
      setTimeout(() => {
        this.styleMap.delete(i);
        this.styleMap.delete(j);
      }, 1000);
    }
  }
  onQueueSwap_b = this.onQueueSwap.bind(this);

  showAdd(i: number) {
    return i === 0;
  }

  showEdit(i: number) {
    return i === this.curEdit;
  }

  onEdit(i: number) {
    if (i === this.queue.length - 1) {
      this.curEdit = i;
    }
  }

  onAdd() {
    if (this.queue) {
      this.queue.unshift('');
    }
  }

  isEditable(i: number) {
    return i === 0;
  }

  isRemovable(i: number) {
    return !this.readonly && i === this.queue.length - 1;
  }

  // 修改 onRemove 函数，只能移除queue的末尾元素
  onRemove(i: number) {
    if (this.queue && i === this.queue.length - 1) {
      const value = this.queue.pop();
      const literal = new LiteralObject(
        String(this.canvasService.uid),
        value
      );
      const { x, y, width, height } = this.canvasService.getRect(this.queue.id)
      const { x: x0, y: y0 } = this.canvasService.rect
      // 从右下角出队
      const position = {
        x: x + width - x0,
        y: y + height - y0,
      };
      this.canvasService.add(
        new CanvasObject(literal.id, literal.type, literal, {
          position,
        })
      );
      this.curEdit = -1;
    }
  }
  onSave(value: any, i: number) {
    this.queue!.set(this.curEdit, value);
    this.curEdit = -1;
  }

  getSlots(): Slots {
    return {
      inputs: [],
      outputs: [],
    };
  }
}
