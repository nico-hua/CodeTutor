import { Component, Input, ViewChild } from '@angular/core';
import { CellComponent } from '../cell/cell.component';
import { IDataStructureComponent } from '../data-structure.component';
import { Slots } from '../../../canvas/ref';
import { RefObject } from '../../../../object/data-structure/ref';

@Component({
  selector: 'app-ref',
  standalone: true,
  imports: [
    CellComponent,
  ],
  templateUrl: './ref.component.html',
  styleUrl: './ref.component.scss'
})
export class RefComponent implements IDataStructureComponent {
  @Input() value!: RefObject<any>
  @Input() readonly = false

  @ViewChild('ref') ref!: CellComponent
  
  getSlots(): Slots {
    return {
      inputs: [],
      outputs: this.ref.getSlots().outputs
    }
  }
}
