import { Component, ElementRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IDataStructureComponent } from '../data-structure.component';
import { Slots } from '../../../canvas/ref';
import HashMapObject from '../../../../object/data-structure/hashMap';
import { LinkListComponent } from '../link-list/link-list.component';
import { CommonModule } from '@angular/common';
import { CellComponent } from '../cell/cell.component';
import { Size } from '../../../drag/drag.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CanvasService } from '../../../canvas/canvas.service';

@Component({
  selector: 'app-hash-map',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule,
    CellComponent,
    LinkListComponent,
  ],
  templateUrl: './hash-map.component.html',
  styleUrl: './hash-map.component.scss'
})
export class HashMapComponent implements IDataStructureComponent {
  @Input('value') map!: HashMapObject<string, any>;
  @Input('readonly') readonly = false;
  @Input('animate') animate = true;
  @Input('showOptions') showOptions = true;
  
  @ViewChild('containerRef') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChildren(CellComponent) cellRefs!: QueryList<CellComponent>;
  @ViewChildren(LinkListComponent) listRefs!: QueryList<LinkListComponent>
  
  constructor(private canvasService: CanvasService) {}

  private heightMap: Map<number, number> = new Map();
  getHeight(index: number) {
    return this.heightMap.get(index) || 50
  }

  onResize(index: number, size: Size) {
    setTimeout(() => this.heightMap.set(index, size.height))
  }

  getSlots(): Slots {
    const { left: x, top: y, width, height } = this.containerRef.nativeElement.getBoundingClientRect()
    const { id } = this.map
    const rect = {
      id, type: 'hashmap',
      x, y, width, height
    }
    const slots: Slots = { inputs: [], outputs: [] }

    this.cellRefs.forEach(cell => {
      const { inputs, outputs } = cell.getSlots()
      slots.inputs.push(...inputs.map(slot => ({ ...slot, rect })))
      slots.outputs.push(...outputs.map(slot => ({ ...slot, rect })))
    })

    this.listRefs.forEach(list => {
      const { inputs, outputs } = list.getSlots()
      slots.inputs.push(...inputs)
      slots.outputs.push(...outputs)
      const { list: { id }, headRect: { x, y, height } } = list
      slots.inputs.push({
        id, x, y: y + height / 2, rect
      })
    })

    return slots
  }

  curKey: string = ''
  curValue: string = ''
  onAdd() {
    if (this.curKey) {
      this.map.begin().set(this.curKey, this.curValue).end()
      this.curKey = ''
      this.curValue = ''
      setTimeout(() => this.autoLayout())
    }
  }

  autoLayout(index?: number) {
    if (index === undefined) {
      this.listRefs.forEach(ref => {
        ref.autoLayout()
      })
    } else {
      this.listRefs.get(index)?.autoLayout()
    }
  }

  onAutoLayout() {
    this.autoLayout()
  }

  mode: 'logical' | 'physical' | 'both' = 'logical';
  onToggleMode() {
    if (this.mode === 'logical') {
      this.mode = 'both'
    } else if (this.mode === 'both') {
      this.mode = 'physical'
    } else {
      this.mode = 'logical'
    }
    setTimeout(() => this.canvasService.render(false))
  }

  onDel(key: string) {
    this.map.begin()
    this.map.delete(key)
    this.map.end()
    setTimeout(() => this.autoLayout())
  }

  onEdit(key: string) {
    this.map.begin()
    this.map.get(key)
    this.map.end()
  }

  onSave(key: string, value: any) {
    this.map.begin().set(key, value).end()
  }
}
