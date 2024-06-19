import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { ListVariable, LiteralVariable, RefVariable, Variable } from '../../../variable';
import { VariableComponent } from '../variable/variable.component';
import { RefComponent } from '../ref/ref.component';
import { Slot, Slots } from '../../../../canvas/ref';
import { CommonModule } from '@angular/common';
import { LiteralComponent } from '../literal/literal.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    VariableComponent,
    LiteralComponent,
    RefComponent,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent extends VariableComponent {
  @Input() list!: ListVariable;
  @ViewChildren(RefComponent) refRefs!: QueryList<RefComponent>;

  override getSlots(): Slots {
    const { width, height, top, left } = this.containerRef.nativeElement.getBoundingClientRect();
    const { id } = this.list;

    const rect = {
      id,
      type: 'TUPLE',
      x: left,
      y: top,
      width,
      height
    }

    const inputs: Slot[] = [{
      id,
      x: left,
      y: top + height / 2,
      rect
    }]

    const outputs: Slot[] = []
    
    this.refRefs.forEach(variable => {
      const slots = variable.getSlots()
      inputs.push(...slots.inputs.map(slot => ({...slot, rect })))
      outputs.push(...slots.outputs.map(slot => ({...slot, rect })))
    })

    return {
      inputs,
      outputs
    }
  }
}
