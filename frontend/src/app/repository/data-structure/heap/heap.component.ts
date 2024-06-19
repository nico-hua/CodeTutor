import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { IDataStructureComponent } from '../data-structure.component';
import { Slots } from '../../../canvas/ref';
import { HeapObject } from '../../../../object/data-structure/heap';
import { CanvasService } from '../../../canvas/canvas.service';
import { CommonModule } from '@angular/common';
import { ArrayComponent } from '../array/array.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LiteralObject } from '../../../../object/data-structure/literal';
import CanvasObject from '../../../canvas/canvasObject';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { TreeComponent } from '../tree/tree.component';
import { Size } from '../../../drag/drag.service';
import { TreeNodeObject } from '../../../../object/data-structure/tree';

@Component({
  selector: 'app-heap',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ArrayComponent,
    TreeComponent,
  ],
  templateUrl: './heap.component.html',
  styleUrl: './heap.component.scss',
})
export class HeapComponent implements IDataStructureComponent, OnChanges {
  @Input('value') heap!: HeapObject<any>;
  @Input('readonly') readonly = false;
  @Input('animate') animate = false;

  @ViewChild('arrayRef') arrRef!: ArrayComponent;
  @ViewChild('treeRef') treeRef!: TreeComponent;

  constructor(private canvasService: CanvasService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['heap']) {
      setTimeout(() => this.treeRef?.autoLayout());
    }
  }

  getDisplayId(node: TreeNodeObject<any>) {
    for (const [i, n] of this.heap.nodeMap) {
      if (node === n) {
        return String(i)
      }
    }
    return '-1'
  }

  mode: 'logical' | 'physical' | 'both' = 'logical';
  onToggleMode() {
    if (this.mode === 'logical') {
      this.mode = 'both';
    } else if (this.mode === 'both') {
      this.mode = 'physical';
    } else {
      this.mode = 'logical';
    }
    setTimeout(() => this.canvasService.render(false));
  }

  curValue = '';
  onPush() {
    if (this.curValue) {
      this.heap.begin().push(this.curValue).end();
      this.curValue = '';
      setTimeout(() => this.treeRef.autoLayout());
    }
  }

  onPop() {
    const value = this.heap.begin().pop();
    this.heap.end()
    const literal = new LiteralObject(String(this.canvasService.uid), value);
    const { x, y, width, height } = this.canvasService.getRect(this.heap.id);
    const { x: x0, y: y0 } = this.canvasService.rect;
    const position = {
      x: x + width - x0,
      y: y + height - y0,
    };
    this.canvasService.add(
      new CanvasObject(literal.id, literal.type, literal, {
        position,
      })
    );
    setTimeout(() => this.treeRef.autoLayout());
  }

  size: Size = {
    width: 0,
    height: 0,
  };
  onResize(size: Size) {
    this.size = size
  }

  getSlots(): Slots {
    const slots: Slots = { inputs: [], outputs: [] };

    for (const ref of [this.arrRef, this.treeRef]) {
      if (!ref) continue
      const { inputs, outputs } = ref.getSlots();
      slots.inputs.push(...inputs);
      slots.outputs.push(...outputs);
    }

    return slots;
  }
}
