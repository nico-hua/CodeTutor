import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { RefObject } from '../../../../object/data-structure/ref';
import { CanvasService } from '../../../canvas/canvas.service';
import { Refable, Slot, Slots } from '../../../canvas/ref';
import DataStructureObject from '../../../../object/data-structure/dataStructure';

@Component({
  selector: 'app-cell',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './cell.component.html',
  styleUrl: './cell.component.scss'
})
export class CellComponent implements OnChanges, Refable {
  @Input() item: any;
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() addible = true;
  @Input() editable = true;
  @Input() removable = true;
  @Input() clearable = false;
  @Input() width = 50;
  @Input() height = 50;
  @Input() style = {};
  @Input() mode: 'normal' | 'chart' = 'normal'
  @Input() context: any = []
  // todo useless now
  @Input() iconSize = 36;

  @Output() edit = new EventEmitter()
  @Output() remove = new EventEmitter()
  @Output() add = new EventEmitter()
  @Output() save = new EventEmitter<any>()

  curValue = ''
  private isHover = false
  private isEdit = false

  @ViewChild('outRef') outRef!: ElementRef<HTMLElement>;
  @ViewChildren(MatInput) matInputs!: QueryList<MatInput>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item']) {
      if (this.isRef && this.ref.value) {
        const { value } = this.ref
        // if (!this.canvasService.getComponent(value.id)) {
        //   setTimeout(() => {
        //     this.canvasService.add(
        //       new CanvasObject(
        //         value.id, value.type, value))
        //   })
        // }
        this.canvasService.onRemove(value.id, () => this.ref.value = null)
        setTimeout(() => this.canvasService.render(false))
      }
    }
  }

  constructor(private canvasService: CanvasService) {}

  get isRef() {
    return this.item instanceof RefObject
  }

  get ref() {
    return this.item as RefObject<any>
  }

  valueOf(item: any) {
    if (!item) return 0
    if (typeof item.valueOf === 'function') {
      return item.valueOf();
    } else if (typeof item === 'number') {
      return item;
    } else {
      console.warn('value can not be cast to a number', item)
      return 0
    }
  }

  get ngClass() {
    const { disabled, mode } = this
    return { disabled, [mode]: true }
  }

  get barHeight() {
    let cur = this.valueOf(this.item)
    let min = cur
    let max = cur
    for (let value of this.context) {
      const num = this.valueOf(value)
      min = Math.min(min, num)
      max = Math.max(max, num)
    }
    let percent = 1.0
    if (min !== max) {
      percent = (cur - min) / (max - min)
    }
    return (0.8 * percent + 0.2) * this.height
  }

  getSlots(): Slots {
    const outputs: Slot[] = []

    if (this.isRef && this.ref.value) {
      const { left, top, width, height } = this.outRef.nativeElement.getBoundingClientRect()
      const { id } = this.ref.value
      outputs.push({
        id,
        x: left + width / 2,
        y: top + height / 2,
      })
    }

    return {
      inputs: [],
      outputs
    }
  }

  get showAdd() {
    return !this.disabled && !this.readonly && this.addible && this.isHover
  }

  get showEdit() {
    return !this.disabled && !this.readonly && this.editable && this.isEdit
  }

  get showRemove() {
    return !this.disabled && !this.readonly && this.removable && this.isHover
  }

  get showClear() {
    return !this.disabled && !this.readonly && this.clearable && this.isEdit && this.curValue
  }

  get cellStyle() {
    return { 
      minWidth: this.width + 'px', 
      transform: `translate(0, ${this.mode === 'chart' ? this.height - this.barHeight : 0}px)`,
      height: (this.mode === 'chart' ? this.barHeight : this.height) + 'px',
      ...this.style, 
    }
  }

  get inputStyle() {
    return {
      height: this.height + 'px',
      lineHeight: this.height + 'px', 
    }
  }

  get removeStyle() {
    return {
      top: this.height + 'px',
      left: (this.height / 2 - this.iconSize / 2) + 'px',
    }
  }

  get addStyle() {
    return {
      top: (this.height / 2 - this.iconSize / 2) + 'px',
      right: -this.iconSize + 'px',
    }
  }

  onMouseEnter(event: MouseEvent) {
    event.stopPropagation()
    this.isHover = true
  }

  onMouseLeave(event: MouseEvent) {
    this.isHover = false
  }

  onRemove(event: MouseEvent) {
    event.stopPropagation()
    this.remove.emit()
    setTimeout(() => this.canvasService.render(false))
  }

  onAdd(event: MouseEvent) {
    event.stopPropagation()
    this.add.emit()
    // 修复多个remove图标的错误
    this.isHover = false
    setTimeout(() => this.canvasService.render(false))
  }

  onClick(event: MouseEvent) {
    if (this.readonly || !this.editable) return
    this.curValue = this.item
    this.isEdit = true
    this.edit.emit()
    setTimeout(() => {
      this.matInputs?.first?.focus()
      window.addEventListener('click', this.onClickOther_b)
    })
  }

  onClickInput(event: MouseEvent) {
    event.stopPropagation()
  }

  onClear(event: MouseEvent) {
    event.stopPropagation()
    this.curValue = ''
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this._save()
    }
  }

  onClickOther(event: MouseEvent) {
    event.stopPropagation()
    this._save()
  }
  onClickOther_b = this.onClickOther.bind(this)

  _save() {
    this.isEdit = false
    this.save.emit(this.curValue)
    window.removeEventListener('click', this.onClickOther_b)
  }

  onClickRef(event: MouseEvent) {
    if (this.readonly) return
    event.stopPropagation()
    this.canvasService.onSelect(
      selected => {
        if (selected.size > 1) {
          console.warn('more than one be selected!')
        }
        const [obj] = selected
        this.ref.value = obj
        this.canvasService.render(false)
      }, 
      {
        selectNum: 1,
        selected: this.ref.value ? new Set([this.ref.value.id]) : new Set(),
        isSelectable: v => v instanceof DataStructureObject
      }
    )
  }
}
