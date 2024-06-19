import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { DictVariable } from '../../../variable';
import { VariableComponent } from '../variable/variable.component';
import { Slot, Slots } from '../../../../canvas/ref';
import { RefComponent } from '../ref/ref.component';
import { CommonModule } from '@angular/common';
import { LiteralComponent } from '../literal/literal.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dict',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    VariableComponent,
    LiteralComponent,
    RefComponent,
  ],
  templateUrl: './dict.component.html',
  styleUrl: './dict.component.scss'
})
export class DictComponent extends VariableComponent {
  @Input() dict!: DictVariable;
  @ViewChildren(RefComponent) refRefs!: QueryList<RefComponent>;

  override getSlots(): Slots {
    const { width, height, top, left } = this.containerRef.nativeElement.getBoundingClientRect();
    const { id } = this.dict;

    const rect = {
      id,
      type: 'DICT',
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
