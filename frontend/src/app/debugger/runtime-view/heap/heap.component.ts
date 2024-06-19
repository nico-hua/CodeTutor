import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Refable, Slots } from '../../../canvas/ref';
import { Variable } from '../../variable';
import { CanvasComponent } from '../../../canvas/canvas.component';
import CanvasObject from '../../../canvas/canvasObject';
import CanvasLayout from '../../../canvas/canvasLayout';
import { Size } from '../../../drag/drag.service';
import { CanvasHandler } from '../../../repository/repository.component';
import { RuntimeService } from '../runtime.service';

@Component({
  selector: 'app-heap',
  standalone: true,
  imports: [
    CommonModule,
    CanvasComponent
  ],
  templateUrl: './heap.component.html',
  styleUrl: './heap.component.scss'
})
export class HeapComponent implements Refable, OnChanges, AfterViewInit {
  @Input() variables!: Variable<any>[];
  @Input() draggable: boolean = false
  @Input() autolayout: boolean = true
  @Input('layout') initLayout: CanvasLayout | null = null;

  @Output('layout') layoutEmitter = new EventEmitter<CanvasLayout>()
  @Output('resize') resizeEmitter = new EventEmitter<Size>()
  
  @ViewChild('canvas') canvas!: CanvasComponent

  canvasHandler: CanvasHandler | null = null
  
  constructor(private runtimeService: RuntimeService) {}

  varMapper(v: Variable<any>) {
    const obj = this.runtimeService.createObject(v)
    return new CanvasObject(obj.id, obj.type, obj, { readonly: !this.draggable })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['variables'] || changes['initLayout']) {
      this.canvasHandler = new CanvasHandler(
        this.variables.map(v => this.varMapper(v)), 
        this.initLayout || new CanvasLayout())
      setTimeout(() => this.canvasHandler!.service = this.canvas.canvasService)
    }
  }

  ngAfterViewInit(): void {
    
  }

  get objects() {
    return this.canvasHandler?.objects ?? []
  }

  get layout() {
    return this.canvasHandler?.layout || null
  }
  
  getSlots(): Slots {
    const slots: Slots = {
      inputs: [],
      outputs: []
    }

    this.canvas.objectRefs.forEach(obj => {
      slots.inputs.push(...obj.getSlots().inputs)
    })
    return slots
  }

  onLayout(layout: CanvasLayout) {
    this.layoutEmitter.emit(layout)
  }

  onResize(size: Size) {
    this.resizeEmitter.emit(size)
  }
}
