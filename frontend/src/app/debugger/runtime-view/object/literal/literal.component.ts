import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { LiteralVariable } from '../../../variable';
import { VariableComponent } from '../variable/variable.component';
import { Slots } from '../../../../canvas/ref';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-literal',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
  ],
  templateUrl: './literal.component.html',
  styleUrl: './literal.component.scss'
})
export class LiteralComponent extends VariableComponent{
  @Input() literal!: LiteralVariable;

  override getSlots(): Slots {
    if (!this.literal || !this.literal.id || !this.containerRef.nativeElement) {

      if (!this.containerRef.nativeElement) {
        console.warn('no container', this.literal, this.containerRef)
      }

      return {
        inputs: [],
        outputs: []
      };
    }

    const { width, height, top, left } = this.containerRef!.nativeElement.getBoundingClientRect() || [];
    const { id } = this.literal;
    return {
      inputs: [{
        id,
        x: left,
        y: top + height / 2,
        rect: {
          id, 
          type: 'LITERAL',
          x: left,
          y: top,
          width: width,
          height: height
        }
      }],
      outputs: []
    };
  }
}
