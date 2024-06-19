import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { LiteralVariable, RefVariable, TupleVariable, Variable } from '../../../variable';
import { NgFor, NgIf } from '@angular/common';
import { Slot, Slots } from '../../../../canvas/ref';
import { VariableComponent } from '../variable/variable.component';
import { LiteralComponent } from '../literal/literal.component';
import { RefComponent } from '../ref/ref.component';

@Component({
  selector: 'app-tuple',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    LiteralComponent,
    RefComponent,
    VariableComponent,
  ],
  templateUrl: './tuple.component.html',
  styleUrl: './tuple.component.scss'
})
export class TupleComponent extends VariableComponent {
  @Input() tuple!: TupleVariable;
  @ViewChildren(RefComponent) refRefs!: QueryList<RefComponent>;

  override getSlots(): Slots {
    const { width, height, top, left } = this.containerRef.nativeElement.getBoundingClientRect();
    const { id } = this.tuple;

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
