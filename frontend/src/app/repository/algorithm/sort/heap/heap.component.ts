import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { ArrayComponent } from '../../../data-structure/array/array.component';
import { HeapSortObject } from '../../../../../object/algorithm/sort/heap';
import { IAlgorithmComponent } from '../../algorithm.component';
import ArrayObject from '../../../../../object/data-structure/array';
import { HeapObject } from '../../../../../object/data-structure/heap';
import { TStepEvent, TSubmitEvent } from '../../algorithm-base/algorithm-base.component';
import { Slots } from '../../../../canvas/ref';
import { HeapComponent } from '../../../data-structure/heap/heap.component';

@Component({
  selector: 'app-heap-sort',
  standalone: true,
  imports: [
    CommonModule,
    ArrayComponent,
    HeapComponent,
  ],
  templateUrl: './heap.component.html',
  styleUrl: './heap.component.scss'
})
export class HeapSortComponent implements IAlgorithmComponent {
  @Input('value') heapSort!: HeapSortObject

  @ViewChild('arrayRef') arrayRef!: ArrayComponent;
  @ViewChild('heapRef') heapRef!: HeapComponent;
  @ViewChild('retRef') retRef!: ArrayComponent;

  array: ArrayObject<any> | null = null;
  heap: HeapObject<any> | null = null
  ret: ArrayObject<any> | null = null;
  onStep({ data, emitter, operations }: TStepEvent): void {
    this.array = data[0] as ArrayObject<any>
    this.heap = null
    this.ret = null
    if (data[1]) {
      this.heap = data[1] as HeapObject<any>
    }
    if (data[2]) {
      this.ret = data[2] as ArrayObject<any>
    }

    setTimeout(() => {
      emitter.begin()
      operations.forEach(({ event, args }) => emitter.notify(event, ...args))
      emitter.end()
    })
  }

  onSubmit(event: TSubmitEvent): void {
    this.array = null
    this.heap = null
    this.ret = null
  }

  getSlots(): Slots {
    const slots: Slots = { inputs: [], outputs: [] }
    for (const ref of [this.arrayRef, this.retRef, this.heapRef]) {
      if (ref) {
        const { inputs, outputs } = ref.getSlots()
        slots.inputs.push(...inputs)
        slots.outputs.push(...outputs)
      }
    }
    return slots
  }
}
