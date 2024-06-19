import { Component, Input, QueryList, ViewChildren, input, output } from '@angular/core';
import { ArrayComponent } from '../../../data-structure/array/array.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AlgorithmBaseComponent, TStepEvent, TSubmitEvent } from '../../algorithm-base/algorithm-base.component';
import { IAlgorithmComponent } from '../../algorithm.component';
import { BubbleSortObject } from '../../../../../object/algorithm/sort/bubble';
import { ArrayObject } from '../../../../../object/data-structure/array';
import { TOperation } from '../../../../../object/data-structure/dataStructure';
import { Refable, Slots } from '../../../../canvas/ref';

@Component({
  selector: 'app-bubble',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    ArrayComponent,
    AlgorithmBaseComponent,
  ],
  templateUrl: './bubble.component.html',
  styleUrl: './bubble.component.scss'
})
export class BubbleComponent implements IAlgorithmComponent, Refable {
  @Input('value') bubble!: BubbleSortObject;

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

  step = 0
  operations: TOperation[] = []

  reset() {
    this.array = null
    this.step = 0
    this.operations = []
  }

  onStep({ step, operations, data }: TStepEvent) {
    this.array = data[0] as ArrayObject<any>
    this.operations = operations
  }
  
  onSubmit(event: TSubmitEvent) {
    this.reset()
  }

  onChange(arrayObj: ArrayObject<any>) {
    this.array!.begin()
    for (const { event, args } of this.operations) {
      this.array!.notify(event, ...args)
    }
    this.array!.end()
  }
}
