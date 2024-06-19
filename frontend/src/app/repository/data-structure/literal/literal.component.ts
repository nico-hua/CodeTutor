import { Component, Input } from '@angular/core';
import { CellComponent } from '../cell/cell.component';
import { IDataStructureComponent } from '../data-structure.component';
import { Slots } from '../../../canvas/ref';
import DataStructureObject from '../../../../object/data-structure/dataStructure';

@Component({
  selector: 'app-literal',
  standalone: true,
  imports: [
    CellComponent
  ],
  templateUrl: './literal.component.html',
  styleUrl: './literal.component.scss'
})
export class LiteralComponent implements IDataStructureComponent {
  @Input('value') literal!: DataStructureObject
  @Input() readonly = false

  getSlots(): Slots {
    return {
      inputs: [],
      outputs: []
    }
  }
}
