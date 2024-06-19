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
import { StackObject } from '../../../../object/data-structure/stack';
import { CanvasService } from '../../../canvas/canvas.service';
import CanvasObject from '../../../canvas/canvasObject';
import { LiteralObject } from '../../../../object/data-structure/literal';

@Component({
  selector: 'app-stack',
  standalone: true,
  imports: [CommonModule, CellComponent],
  templateUrl: './stack.component.html',
  styleUrl: './stack.component.scss',
})
export class StackComponent implements IDataStructureComponent, OnChanges {
  @Input('value') initStack!: StackObject<any>;
  @Input('readonly') readonly!: boolean;
  @Input('animate') animate: boolean = false;
  
  @Output('change') changeEmitter = new EventEmitter<StackObject<any>>();

  @ViewChild('containerRef') containerRef!: ElementRef<HTMLDivElement>;

  curEdit = -1;

  stack!: StackObject<any>;

  styleMap: Map<number, Record<string, string>> = new Map();

  constructor(private canvasService: CanvasService) {}

  style(i: number) {
    return this.styleMap.get(i) || {};
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initStack']) {
      this.stack = this.initStack
        .on(StackObject.Event.GET, this.onStackGet_b)
        .on(StackObject.Event.UPDATE, this.onStackUpdate_b)
        .on(StackObject.Event.ADD, this.onStackAdd_b)
        .on(StackObject.Event.REMOVE, this.onStackRemove_b)
        .on(StackObject.Event.SWAP, this.onStackSwap_b);

      changes['initStack'].previousValue
        ?.off(StackObject.Event.GET, this.onStackGet_b)
        .off(StackObject.Event.UPDATE, this.onStackUpdate_b)
        .off(StackObject.Event.ADD, this.onStackAdd_b)
        .off(StackObject.Event.REMOVE, this.onStackRemove_b)
        .off(StackObject.Event.SWAP, this.onStackSwap_b);

      this.changeEmitter.emit(this.stack);
    }
  }

  onStackGet(i: number, v: any) {
    if (this.animate) {
      this.styleMap.set(i, { backgroundColor: 'red', color: 'white' });
      setTimeout(() => {
        this.styleMap.delete(i);
      }, 1000);
    }
  }
  onStackGet_b = this.onStackGet.bind(this);

  onStackUpdate(i: number, v: any, vold: any) {
    if (this.animate) {
      // todo
    }
  }
  onStackUpdate_b = this.onStackUpdate.bind(this);

  onStackAdd(i: number, ...vs: any[]) {
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
  onStackAdd_b = this.onStackAdd.bind(this);

  onStackRemove(i: number, ...vs: any[]) {
    if (this.animate) {
      // todo
    }
  }
  onStackRemove_b = this.onStackRemove.bind(this);

  onStackSwap(i: number, j: number, vi: any, vj: any) {
    if (this.animate) {
      this.styleMap.set(i, { backgroundColor: 'green', color: 'white' });
      this.styleMap.set(j, { backgroundColor: 'green', color: 'white' });
      setTimeout(() => {
        this.styleMap.delete(i);
        this.styleMap.delete(j);
      }, 1000);
    }
  }
  onStackSwap_b = this.onStackSwap.bind(this);

  showAdd(i: number) {
    return i === (this.stack?.length || 0) - 1;
  }

  showEdit(i: number) {
    return i === this.curEdit;
  }

  onEdit(i: number) {
    if (i === this.stack.length - 1) {
      this.curEdit = i;
    }
  }

  onAdd() {
    this.stack!.push('');
  }

  isEditable(i: number) {
    return i === this.stack.length - 1;
  }

  isRemovable(i: number) {
    return !this.readonly && i === this.stack.length - 1;
  }

  // 修改 onRemove 函数，只能移除 stack 的末尾元素
  onRemove(i: number) {
    if (this.stack && i === this.stack.length - 1) {
      const value = this.stack.pop();
      const literal = new LiteralObject(String(this.canvasService.uid), value);
      const { x, y, width, height } = this.canvasService.getRect(this.stack.id)
      const { x: x0, y: y0 } = this.canvasService.rect
      // 从右下角出栈
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
    this.stack!.set(this.curEdit, value);
    this.curEdit = -1;
  }

  getSlots(): Slots {
    return {
      inputs: [],
      outputs: [],
    };
  }
}
