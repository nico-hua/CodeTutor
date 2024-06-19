import { Component, Input } from '@angular/core';
import { IAlgorithmComponent } from '../../algorithm.component';
import { TStepEvent, TSubmitEvent } from '../../algorithm-base/algorithm-base.component';
import { CommonModule } from '@angular/common';
import { ArrayComponent } from '../../../data-structure/array/array.component';
import { QuickSortObject } from '../../../../../object/algorithm/sort/quick';
import ArrayObject from '../../../../../object/data-structure/array';

@Component({
  selector: 'app-quick',
  standalone: true,
  imports: [
    CommonModule,
    ArrayComponent
  ],
  templateUrl: './quick.component.html',
  styleUrl: './quick.component.scss'
})
export class QuickComponent implements IAlgorithmComponent {
  @Input('value') quick!: QuickSortObject; 

  arrays: ArrayObject<any>[] = []
  emitter: ArrayObject<any> | null = null

  style(array: ArrayObject<any>) {
    if (array === this.emitter) {
      return {
        backgroundColor: 'lightcyan',
      }
    }
    return {}
  }
  onStep({ data, emitter, operations }: TStepEvent): void {
    this.arrays = data.map(obj => obj as ArrayObject<any>)
    this.emitter = emitter as ArrayObject<any>
    setTimeout(() => {
      emitter.begin()
      operations.forEach(op => emitter.notify(op.event, ...op.args))
      emitter.end()
    })
  }

  onSubmit(event: TSubmitEvent): void {
    this.arrays = []
    this.emitter = null
  }
  
}
