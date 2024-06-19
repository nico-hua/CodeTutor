import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Refable, Slots } from '../../canvas/ref';
import { AlgorithmObject } from '../../../object/algorithm/algorithm';
import { AlgorithmBaseComponent, TStepEvent, TSubmitEvent } from './algorithm-base/algorithm-base.component';
import CanvasObject from '../../canvas/canvasObject';
import { CommonModule } from '@angular/common';
import { BubbleComponent } from './sort/bubble/bubble.component';
import { MatCardModule } from '@angular/material/card';
import { BubbleSortObject } from '../../../object/algorithm/sort/bubble';
import { MergeComponent } from './sort/merge/merge.component';
import MergeSortObject from '../../../object/algorithm/sort/merge';
import { CanvasService } from '../../canvas/canvas.service';
import { DfsComponent } from './graph/dfs/dfs.component';
import { DFSObject } from '../../../object/algorithm/graph/dfs';
import { QuickSortObject } from '../../../object/algorithm/sort/quick';
import { QuickComponent } from './sort/quick/quick.component';
import { DijkstraComponent } from './dijkstra/dijkstra.component';
import { DijkstraObject } from '../../../object/algorithm/graph/dijkstra';
import { BuildHeapComponent } from './build-heap/build-heap.component';
import { BuildHeapObject } from '../../../object/algorithm/buidHeap';
import { HeapSortObject } from '../../../object/algorithm/sort/heap';
import { HeapSortComponent } from './sort/heap/heap.component';
import { InsertSortObject } from '../../../object/algorithm/sort/insert';
import { SelectSortObject } from '../../../object/algorithm/sort/select';
import { InsertComponent } from './sort/insert/insert.component';
import { SelectComponent } from './sort/select/select.component';

export interface IAlgorithmComponent {
  onStep(event: TStepEvent): void;
  onSubmit(event: TSubmitEvent): void;
}

@Component({
  selector: 'app-algorithm',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    AlgorithmBaseComponent,
    InsertComponent,
    SelectComponent,
    BubbleComponent,
    MergeComponent,
    QuickComponent,
    HeapSortComponent,
    BuildHeapComponent,
    DfsComponent,
    DijkstraComponent,
  ],
  templateUrl: './algorithm.component.html',
  styleUrl: './algorithm.component.scss'
})
export class AlgorithmComponent implements OnChanges {
  @Input() value!: AlgorithmObject;
  @Input() readonly = false
  
  @ViewChild('objectRef') objectRef!: IAlgorithmComponent;
  
  children: AlgorithmObject[] = []
  constructor(private canvasService: CanvasService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.canvasService.onRemove(this.value.id, this.remove.bind(this))
    }
  }

  get insert() {
    return this.value as InsertSortObject
  }

  get select() {
    return this.value as SelectSortObject
  }

  get bubble() {
    return this.value as BubbleSortObject
  }

  get merge() {
    return this.value as MergeSortObject
  }

  get quick() {
    return this.value as QuickSortObject
  }

  get heap() {
    return this.value as HeapSortObject
  }

  get buildHeap() {
    return this.value as BuildHeapObject
  }

  get dfs() {
    return this.value as DFSObject
  }

  get dijkstra() {
    return this.value as DijkstraObject
  }

  onStep(event: TStepEvent) {
    const { children } = event
    this.remove()
    this.children = children
    setTimeout(() => {
      let { x, y, width, height } = this.canvasService.getRect(this.merge.id)
      const { x: x0, y: y0 } = this.canvasService.rect
      x -= x0
      y -= y0
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        this.canvasService.add(
          new CanvasObject(child.id, child.type, child, {
            readonly: true,
            position: { 
              x: x + width + 20,
              y: y - (children.length - 1) * height / 2 + i * height
            },
          }),
        )
      }
      this.objectRef?.onStep(event)
    })
  }
  
  onSubmit(event: TSubmitEvent) {
    if (!this.readonly) {
      this.remove()
      this.children = []
      this.objectRef?.onSubmit(event)
    }
    const { data: datas, position: { x, y } } = event
    const { x: x0, y: y0 } = this.canvasService.rect
    const position = { x: x - x0, y: y - y0 }
    for (const data of datas) {
      this.canvasService.add(
        new CanvasObject(
          data.id, data.type, data,
          { position }),
      )
    }
  }

  getSlots(): Slots {
    const slots: Slots = { inputs: [], outputs: [] }

    const { id } = this.value
    const { x, y, width, height } = this.canvasService.getRect(id)
    const delta = height / (this.children.length + 1)
    
    slots.inputs.push(...[{
      id,
      x,
      y: y + height / 2,
      rect: { id, type: 'alg', x, y, width, height }
    }]) 
    slots.outputs.push(...this.children.map((child, i) => {
      return {
        id: child.id,
        x: x + width,
        y: y + (i + 1) * delta,
        rect: { id, type: 'alg', x, y, width, height }
      }
    }))

    if ((this.objectRef as any)?.getSlots) {
      const { inputs, outputs } = (this.objectRef as unknown as Refable).getSlots()
      slots.inputs.push(...inputs)
      slots.outputs.push(...outputs)
    }
    
    return slots
  }

  remove() {
    for (const child of this.children) {
      this.canvasService.remove(child.id) 
    }
  }
}
