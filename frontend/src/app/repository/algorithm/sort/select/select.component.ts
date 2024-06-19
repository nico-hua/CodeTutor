import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { IAlgorithmComponent } from '../../algorithm.component';
import { ArrayComponent } from '../../../data-structure/array/array.component';
import { Slots } from '../../../../canvas/ref';
import ArrayObject from '../../../../../object/data-structure/array';
import { TStepEvent, TSubmitEvent } from '../../algorithm-base/algorithm-base.component';
import { CommonModule } from '@angular/common';
import { SelectSortObject } from '../../../../../object/algorithm/sort/select';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [
    CommonModule,
    ArrayComponent
  ],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss'
})
export class SelectComponent implements IAlgorithmComponent {
  @Input('value') select!: SelectSortObject;

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
