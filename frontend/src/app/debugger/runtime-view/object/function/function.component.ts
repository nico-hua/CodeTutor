import { Component, Input } from '@angular/core';
import { VariableComponent } from '../variable/variable.component';
import { Slots } from '../../../../canvas/ref';
import { FunctionVariable } from '../../../variable';

@Component({
  selector: 'app-function',
  standalone: true,
  imports: [],
  templateUrl: './function.component.html',
  styleUrl: './function.component.scss'
})
export class FunctionComponent extends VariableComponent {
  @Input() func!: FunctionVariable;

  override getSlots(): Slots {
    const { width, height, top, left } = this.containerRef.nativeElement.getBoundingClientRect();
    const { id } = this.func;
    const rect = {
      id,
      type: 'FUNCTION',
      x: left,
      y: top,
      width,
      height,
    }
    return {
      inputs: [{
        id,
        x: left,
        y: top + height / 2,
        rect
      }],
      outputs: [],
    };
  }
}
