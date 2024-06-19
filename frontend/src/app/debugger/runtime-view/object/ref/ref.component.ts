import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { VariableComponent } from '../variable/variable.component';
import { Slots } from '../../../../canvas/ref';
import { RefVariable } from '../../../variable';

@Component({
  selector: 'app-ref',
  standalone: true,
  imports: [],
  templateUrl: './ref.component.html',
  styleUrl: './ref.component.scss'
})
export class RefComponent extends VariableComponent {
  @Input() ref!: RefVariable;
  @ViewChild('outputref') outputref! : ElementRef<HTMLElement>;

  override getSlots(): Slots {
    const { width, height, top, left } = this.containerRef.nativeElement.getBoundingClientRect();
    const { width: w, height: h, top: t, left: l } = this.outputref.nativeElement.getBoundingClientRect();
    const { id, value } = this.ref;
    const rect = {
      id,
      type: 'REF',
      x: left,
      y: top,
      width,
      height,
    }
    return {
      inputs: [],
      outputs: [{
        id: value,
        x: l + w / 2,
        y: t + h / 2,
        rect
      }]
    };
  }
}
