import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { VariableComponent } from '../variable/variable.component';
import { LiteralVariable, RefVariable, SetVariable, Variable } from '../../../variable';
import { RefComponent } from '../ref/ref.component';
import { CommonModule } from '@angular/common';
import { LiteralComponent } from '../literal/literal.component';
import { Slot, Slots } from '../../../../canvas/ref';

@Component({
  selector: 'app-set',
  standalone: true,
  imports: [
    CommonModule,
    VariableComponent,
    LiteralComponent,
    RefComponent,
  ],
  templateUrl: './set.component.html',
  styleUrl: './set.component.scss'
})
export class SetComponent extends VariableComponent {
  @Input() set!: SetVariable;
  @ViewChildren(RefComponent) refRefs!: QueryList<RefComponent>;

  override getSlots(): Slots {
    const { width, height, top, left } = this.containerRef.nativeElement.getBoundingClientRect();
    const { id } = this.set;

    const rect = {
      id,
      type: 'SET',
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
