import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AlgorithmObject, TAlgorithmState } from '../../../../object/algorithm/algorithm';
import { DataStructureObject } from '../../../../object/data-structure/dataStructure';
import { Position } from '../../../canvas/ref';

export type TStepEvent = { 
  step: number; 
} & TAlgorithmState

export type TSubmitEvent = {
  data: DataStructureObject[];
  position: Position;
}

@Component({
  selector: 'app-algorithm-base',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSliderModule,
  ],
  templateUrl: './algorithm-base.component.html',
  styleUrl: './algorithm-base.component.scss'
})
export class AlgorithmBaseComponent {
  @Input() algorithm!: AlgorithmObject;
  @Input() readonly = false;

  @Output('step') stepEmitter = new EventEmitter<TStepEvent>();
  @Output('submit') submitEmitter = new EventEmitter<TSubmitEvent>();

  inputs: DataStructureObject[] = [];
  states: TAlgorithmState[] = [];
  curStep = -1;

  stepLabel(step: number) {
    return `${step}`
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['algorithm']) {
      changes['algorithm'].previousValue
        ?.offBind(this.onBind_b)
        ?.offUnbind(this.onUnBind_b)
      this.algorithm
        .onBind(this.onBind_b)
        .onUnbind(this.onUnBind_b)
    }
  }

  onBind(states: TAlgorithmState[], ...inputs: DataStructureObject[]) {
    this.inputs = inputs
    this.states = states
    this.stepTo(0)
  }
  onBind_b = this.onBind.bind(this)

  onUnBind() {
    this.inputs = []
    this.states = []
    this.curStep = -1
  }
  onUnBind_b = this.onUnBind.bind(this)

  get disabled() {
    return this.curStep < 0
  }

  onStepTo(step: number) {
    this.stepTo(step - 1)
  }

  stepTo(step: number) {
    if (step < 0 || step >= this.states.length) {
      console.warn(`step out of range: ${step}`);
      return
    }
    this.curStep = step
    this.stepEmitter.emit({
      step,
      ...this.states[step]
    })
  }

  onPrev() {
    this.stepTo((this.curStep + this.states.length - 1) % this.states.length)
  }

  onNext() {
    this.stepTo((this.curStep + 1) % this.states.length)
  }

  onSubmit(event: MouseEvent) {
    const { data } = this.states[this.curStep]
    const { clientX: x, clientY: y } = event
    this.submitEmitter.emit({
      data,
      position: { x, y }
    })
    if (!this.readonly) {
      this.algorithm.unbind()
    }
  }
}
