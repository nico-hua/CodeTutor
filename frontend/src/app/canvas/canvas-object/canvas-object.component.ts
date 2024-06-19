import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Refable, Slots } from '../ref';
import { CommonModule } from '@angular/common';
import CanvasObject from '../canvasObject';
import { DragIconComponent } from '../drag-icon/drag-icon.component';
import { DataStructureComponent } from '../../repository/data-structure/data-structure.component';
import { AlgorithmComponent } from '../../repository/algorithm/algorithm.component';
import { CanvasService } from '../canvas.service';

@Component({
  selector: 'app-canvas-object',
  standalone: true,
  imports: [
    CommonModule,
    DragIconComponent,
    DataStructureComponent,
    AlgorithmComponent,
  ],
  templateUrl: './canvas-object.component.html',
  styleUrl: './canvas-object.component.scss'
})
export class CanvasObjectComponent implements Refable, OnInit, OnDestroy {
  @Input() object!: CanvasObject<any>;
  @Input('readonly') forceReadonly: boolean = false;

  @ViewChild('containerRef') containerRef!: ElementRef;
  @ViewChild('objectRef') objectRef!: Refable;

  constructor(private canvasService: CanvasService) {}

  get readonly() {
    return this.forceReadonly || this.object.props.readonly;
  }

  ngOnInit(): void {
    this.canvasService.register(this)
  }

  ngOnDestroy(): void {
    this.canvasService.unregister(this)
  }

  get value() {
    return this.object.data
  }

  get props() {
    return this.object.props
  }

  get isDataStructure() {
    return this.object.type.startsWith('ds-')
  }

  get isAlgorithm() {
    return this.object.type.startsWith('alg-')
  }

  get rect() {
    const { left: x, top: y, width, height } = this.containerRef.nativeElement.getBoundingClientRect();
    return { x, y, width, height }
  }

  getSlots(): Slots {
    return this.objectRef?.getSlots() || { inputs: [], outputs: [] };
  }
}
