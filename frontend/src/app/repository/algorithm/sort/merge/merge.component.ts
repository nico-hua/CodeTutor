import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { IAlgorithmComponent } from '../../algorithm.component';
import { TStepEvent, TSubmitEvent } from '../../algorithm-base/algorithm-base.component';
import MergeSortObject from '../../../../../object/algorithm/sort/merge';
import { CommonModule } from '@angular/common';
import { ArrayComponent } from '../../../data-structure/array/array.component';
import ArrayObject from '../../../../../object/data-structure/array';
import { TOperation } from '../../../../../object/data-structure/dataStructure';
import { Refable, Slots } from '../../../../canvas/ref';

@Component({
  selector: 'app-merge',
  standalone: true,
  imports: [
    CommonModule,
    ArrayComponent,
  ],
  templateUrl: './merge.component.html',
  styleUrl: './merge.component.scss'
})
export class MergeComponent implements IAlgorithmComponent, Refable {
  @Input('value') merge!: MergeSortObject

  arrays: ArrayObject<any>[] = []
  emitter: ArrayObject<any> | null = null
  operations: TOperation[] = []

  @ViewChildren(ArrayComponent) arrayRefs!: QueryList<ArrayComponent>

  getSlots(): Slots {
    const slots: Slots = { inputs: [], outputs: [] }
    this.arrayRefs.forEach(array => {
      const { outputs } = array.getSlots()
      slots.outputs.push(...outputs)
    })
    return slots
  }

  constructor() {}

  style(array: ArrayObject<any>) {
    if (array === this.emitter) {
      return {
        backgroundColor: 'lightcyan',
      }
    }
    return {}
  }

  onStep({ emitter, operations, data, children }: TStepEvent) {
    this.arrays = data as ArrayObject<any>[]
    this.emitter = emitter as ArrayObject<any>
    this.operations = operations
  }

  onSubmit(event: TSubmitEvent) {
    this.emitter = null
    this.operations = []
    this.arrays = []
  }

  onChange(arrayObj: ArrayObject<any>) {
    this.emitter!.begin()
    for (const { event, args } of this.operations) {
      this.emitter!.notify(event, ...args)
    }
    this.emitter!.end()
  }
}
