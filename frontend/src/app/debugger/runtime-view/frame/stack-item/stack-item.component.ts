import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Refable, Slots } from '../../../../canvas/ref';
import { ItemVariable, RefVariable, Variable } from '../../../variable';
import { NgIf } from '@angular/common';
import { TStackVariable } from '../../../tracer';

@Component({
  selector: 'app-stack-item',
  standalone: true,
  imports: [NgIf],
  templateUrl: './stack-item.component.html',
  styleUrl: './stack-item.component.scss'
})
export class StackItemComponent implements Refable {
  @Input() item!: ItemVariable;

  @ViewChild('itemRef') itemRef!: ElementRef;

  getSlots(): Slots {
    const outputs = []

    if (this.item.type == 'REF') {
      const { width, height, top, left } = this.itemRef.nativeElement.getBoundingClientRect();
      outputs.push({
        id: (this.item as RefVariable).value,
        x: left + width / 2,
        y: top + height / 2
      });
    }
    
    return {
      inputs: [], 
      outputs
    };
  }
}
