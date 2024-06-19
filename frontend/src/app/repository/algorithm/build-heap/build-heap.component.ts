import { Component, Input, ViewChild } from '@angular/core';
import { IAlgorithmComponent } from '../algorithm.component';
import { TStepEvent, TSubmitEvent } from '../algorithm-base/algorithm-base.component';
import { BuildHeapObject } from '../../../../object/algorithm/buidHeap';
import ArrayObject from '../../../../object/data-structure/array';
import { TreeNodeObject, TreeObject } from '../../../../object/data-structure/tree';
import { HeapObject } from '../../../../object/data-structure/heap';
import { CommonModule } from '@angular/common';
import { ArrayComponent } from '../../data-structure/array/array.component';
import { TreeComponent } from '../../data-structure/tree/tree.component';
import { HeapComponent } from '../../data-structure/heap/heap.component';
import { Slots } from '../../../canvas/ref';

@Component({
  selector: 'app-build-heap',
  standalone: true,
  imports: [
    CommonModule,
    ArrayComponent,
    TreeComponent,
    HeapComponent
  ],
  templateUrl: './build-heap.component.html',
  styleUrl: './build-heap.component.scss'
})
export class BuildHeapComponent implements IAlgorithmComponent {
  @Input('value') value!: BuildHeapObject;

  @ViewChild('arrayRef') arrayRef!: ArrayComponent;
  @ViewChild('treeRef') treeRef!: TreeComponent;
  @ViewChild('heapRef') heapRef!: HeapComponent;

  array: ArrayObject<any> | null = null;
  tree: TreeObject<any> | null = null;
  heap: HeapObject<any> | null = null
  onStep({ data, emitter, operations }: TStepEvent): void {
    this.array = data[0] as ArrayObject<any>
    this.tree = null
    this.heap = null
    if (data[1]) {
      if (data[1] instanceof TreeObject) {
        this.tree = data[1] as TreeObject<any>
      } else {
        this.heap = data[1] as HeapObject<any>
      }
    }

    setTimeout(() => {
      emitter.begin()
      operations.forEach(({ event, args }) => emitter.notify(event, ...args))
      emitter.end()
    })
  }

  onSubmit(event: TSubmitEvent): void {
    this.array = null
    this.tree = null
    this.heap = null
  }

  getSlots(): Slots {
    const slots: Slots = { inputs: [], outputs: [] }
    for (const ref of [this.arrayRef, this.treeRef, this.heapRef]) {
      if (ref) {
        const { inputs, outputs } = ref.getSlots()
        slots.inputs.push(...inputs)
        slots.outputs.push(...outputs)
      }
    }
    return slots
  }

  getDisplayId(node: TreeNodeObject<any>) {
    return String(Array.from(this.array!).indexOf(node.value))
  }
}
