import {
  Component,
  Input,
  OnChanges,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Refable, Slots } from '../../../../canvas/ref';
import { ItemVariable, Literal, LiteralVariable } from '../../../variable';
import { CellComponent } from '../../../../repository/data-structure/cell/cell.component';
import { RefObject } from '../../../../../object/data-structure/ref';
import { RuntimeService } from '../../runtime.service';

@Component({
  selector: 'app-stack',
  standalone: true,
  imports: [CommonModule, CellComponent],
  templateUrl: './stack.component.html',
  styleUrl: './stack.component.scss',
})
export class StackComponent implements Refable, OnChanges {
  @Input() items!: ItemVariable[];

  @ViewChildren(CellComponent) cellRefs!: QueryList<CellComponent>;

  constructor(private runtimeService: RuntimeService) {}
  objects: { id: string; value: RefObject<any> | Literal }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      const objs = [];
      for (const item of this.items) {
        const { id, type, value } = item;
        if (type === 'REF') {
          objs.push({
            id,
            value: this.runtimeService.createObject(item) as RefObject<any>,
          });
        } else if (type === 'LITERAL') {
          objs.push({
            id,
            value,
          });
        } else {
          console.warn('unknown stack item: ', item);
        }
      }
      this.objects = objs;
    }
  }

  isRef(item: RefObject<any> | LiteralVariable) {
    return item instanceof RefObject;
  }

  getSlots(): Slots {
    const slots: Slots = {
      inputs: [],
      outputs: [],
    };
    this.cellRefs.forEach((cell) => {
      const { inputs, outputs } = cell.getSlots();
      slots.inputs.push(...inputs);
      slots.outputs.push(...outputs);
    });
    return slots;
  }
}
