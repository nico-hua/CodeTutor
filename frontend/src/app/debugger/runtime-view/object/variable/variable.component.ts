import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Refable, Slots } from '../../../../canvas/ref';
import { LiteralVariable, RefVariable, Variable } from '../../../variable';

@Component({
  selector: 'app-variable',
  standalone: true,
  imports: [],
  templateUrl: './variable.component.html',
  styleUrl: './variable.component.scss'
})
export class VariableComponent implements Refable {
  @Input() variable!: Variable<any>;
  @ViewChild('containerRef') containerRef!: ElementRef<HTMLElement>;
  
  getLiteral(value: Variable<any>) {
    return value as LiteralVariable
  }

  getRef(value: Variable<any>) {
    return value as RefVariable
  }

  getSlots(): Slots {
    if (!this.variable) {
      return {
        inputs: [],
        outputs: []
      };
    }

    const { width, height, top, left } = this.containerRef?.nativeElement.getBoundingClientRect() || [];
    
    return {
      inputs: [{
        id: this.variable.id,
        x: left,
        y: top + height / 2,
      }],
      outputs: []
    };
  }
}
