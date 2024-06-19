import { Component, EventEmitter, Input, OnChanges, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Slot, Slots } from '../../../canvas/ref';
import { CellComponent } from '../cell/cell.component';
import { IDataStructureComponent } from '../data-structure.component';
import { ArrayObject } from '../../../../object/data-structure/array';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-array',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    CellComponent,
  ],
  templateUrl: './array.component.html',
  styleUrl: './array.component.scss'
})
export class ArrayComponent implements IDataStructureComponent, OnChanges {
  @Input('value') initArray!: ArrayObject<any>;
  @Input('readonly') initReadonly!: boolean;
  @Input('animate') animate: boolean = false;
  @Input('showOptions') showOptions = true

  @Output('change') changeEmitter = new EventEmitter<ArrayObject<any>>()

  @ViewChildren(CellComponent) cells!: QueryList<CellComponent>;

  curEdit = -1

  array: ArrayObject<any> | null = null

  styleMap: Map<number, Record<string, string>> = new Map()

  style(i: number) {
    return this.styleMap.get(i) || {}
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initArray']) {
      this.array = this.initArray
        .on(ArrayObject.Event.GET, this.onArrayGet_b)
        .on(ArrayObject.Event.UPDATE, this.onArrayUpdate_b)
        .on(ArrayObject.Event.ADD, this.onArrayAdd_b)
        .on(ArrayObject.Event.REMOVE, this.onArrayRemove_b)
        .on(ArrayObject.Event.SWAP, this.onArraySwap_b)
        .on(ArrayObject.Event.COMPARE, this.onArrayCompare_b)

      changes['initArray'].previousValue
        ?.off(ArrayObject.Event.GET, this.onArrayGet_b)
        .off(ArrayObject.Event.UPDATE, this.onArrayUpdate_b)
        .off(ArrayObject.Event.ADD, this.onArrayAdd_b)
        .off(ArrayObject.Event.REMOVE, this.onArrayRemove_b)
        .off(ArrayObject.Event.SWAP, this.onArraySwap_b)
        .off(ArrayObject.Event.COMPARE, this.onArrayCompare_b)
      
      this.changeEmitter.emit(this.array)
    }
  }

  onArrayGet(i: number, v: any) {
    if (this.animate) {
      this.styleMap.set(i, { background: 'dodgerblue', color: 'white' })
      setTimeout(() => {
        this.styleMap.delete(i)
      }, 1000)
    }
  }
  onArrayGet_b = this.onArrayGet.bind(this)

  onArrayUpdate(i: number, v: any, vold: any) {
    if (this.animate) {
      this.styleMap.set(i, { color: 'red' })
      setTimeout(() => this.styleMap.delete(i), 1000)
    }
  }
  onArrayUpdate_b = this.onArrayUpdate.bind(this)

  onArrayAdd(i: number, ...vs: any[]) {
    if (this.animate) {
      for (let j = i; j < i + vs.length; j++) {
        this.styleMap.set(j, { color: 'red' })
      }
      setTimeout(() => {
        for (let j = i; j < i + vs.length; j++) {
          this.styleMap.delete(j)
        }
      }, 1000)
    }
  }
  onArrayAdd_b = this.onArrayAdd.bind(this)

  onArrayRemove(i: number, ...vs: any[]) {
    if (this.animate) {
      // todo
    }
  }
  onArrayRemove_b = this.onArrayRemove.bind(this)

  onArraySwap(i: number, j: number, vi: any, vj: any) {
    if (this.animate) {
      this.styleMap.set(i, { background: 'yellow' })
      this.styleMap.set(j, { background: 'yellow' })
      setTimeout(() => {
        this.styleMap.delete(i)
        this.styleMap.delete(j)
      }, 1000)
    }
  }
  onArraySwap_b = this.onArraySwap.bind(this)

  onArrayCompare(i: number, j: number, res: boolean) {
    if (this.animate) {
      if (res) {
        this.styleMap.set(i, { background: 'green', color: 'white' })
        this.styleMap.set(j, { background: 'green', color: 'white' })
      } else {
        this.styleMap.set(i, { background: 'red', color: 'white' })
        this.styleMap.set(j, { background: 'red', color: 'white' })
      }
      setTimeout(() => {
        this.styleMap.delete(i)
        this.styleMap.delete(j)
      }, 1000)
    }
  }
  onArrayCompare_b = this.onArrayCompare.bind(this)

  get readonly() {
    return this.mode === 'chart' || this.initReadonly
  }

  showAdd(i: number) {
    return i === (this.array?.length || 0) - 1
  }

  showEdit(i: number) {
    return i === this.curEdit
  }

  onEdit(i: number) {
    this.curEdit = i
  }

  onRemove(i: number) {
    this.curEdit = -1
    this.array!.splice(i, 1)
  }

  onAdd(i: number) {
    this.array!.push('')
  }

  onSave(value: any, i: number) {
    this.array!.set(this.curEdit, value)
    this.curEdit = -1
  }

  mode: 'normal' | 'chart' = 'normal'
  onToggleMode() {
    this.mode = this.mode === 'normal' ? 'chart' : 'normal'
  }

  getSlots(): Slots {
    const inputs: Slot[] = []
    const outputs: Slot[] = []

    this.cells.forEach(cell => {
      const slots = cell.getSlots()
      inputs.push(...slots.inputs)
      outputs.push(...slots.outputs)
    })

    return {
      inputs,
      outputs
    }
  }
}
