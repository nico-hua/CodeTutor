import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { InstanceVariable } from '../../../variable';
import { RefComponent } from '../ref/ref.component';
import { Slot, Slots } from '../../../../canvas/ref';
import { VariableComponent } from '../variable/variable.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { LiteralComponent } from '../literal/literal.component';

@Component({
  selector: 'app-instance',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    VariableComponent,
    LiteralComponent,
    RefComponent,
  ],
  templateUrl: './instance.component.html',
  styleUrl: './instance.component.scss'
})
export class InstanceComponent extends VariableComponent {
  @Input() instance!: InstanceVariable;
  @ViewChildren(RefComponent) refRefs!: QueryList<RefComponent>;

  override getSlots(): Slots {
    const { width, height, top, left } = this.containerRef.nativeElement.getBoundingClientRect();
    const { id } = this.instance;

    const rect = {
      id,
      type: 'INSTANCE',
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
