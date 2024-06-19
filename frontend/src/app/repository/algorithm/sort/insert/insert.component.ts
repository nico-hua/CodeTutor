import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { InsertSortObject } from '../../../../../object/algorithm/sort/insert';
import { ArrayComponent } from '../../../data-structure/array/array.component';
import { Slots } from '../../../../canvas/ref';
import ArrayObject from '../../../../../object/data-structure/array';
import { TStepEvent, TSubmitEvent } from '../../algorithm-base/algorithm-base.component';
import { IAlgorithmComponent } from '../../algorithm.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-insert',
  standalone: true,
  imports: [
    CommonModule,
    ArrayComponent
  ],
  templateUrl: './insert.component.html',
  styleUrl: './insert.component.scss'
})
export class InsertComponent implements IAlgorithmComponent {
  @Input('value') insert!: InsertSortObject;

  @ViewChildren(ArrayComponent) arrayRefs!: QueryList<ArrayComponent>

  getSlots(): Slots {
    const slots: Slots = { inputs: [], outputs: [] }
    this.arrayRefs.forEach(array => {
      const { outputs } = array.getSlots()
      slots.outputs.push(...outputs)
    })
    return slots
  }

  array: ArrayObject<any> | null = null
  tmp: ArrayObject<any> | null = null

  onStep({ operations, data, emitter }: TStepEvent) {
    this.array = data[0] as ArrayObject<any>
    if (data[1]) {
      this.tmp = data[1] as ArrayObject<any>
    } else {
      this.tmp = null
    }

    setTimeout(() => {
      emitter.begin()
      operations.forEach(({ event, args }) => emitter.notify(event, ...args))
      emitter.end()
    })
  }
  
  onSubmit(event: TSubmitEvent) {
    this.array = null
    this.tmp = null
  }
}
