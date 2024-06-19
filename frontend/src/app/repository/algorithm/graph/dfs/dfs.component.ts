import { Component, Input, ViewChild } from '@angular/core';
import { IAlgorithmComponent } from '../../algorithm.component';
import { TStepEvent, TSubmitEvent } from '../../algorithm-base/algorithm-base.component';
import GraphObject, { GraphNodeObject } from '../../../../../object/data-structure/graph';
import { GraphComponent } from '../../../data-structure/graph/graph.component';
import { DFSObject } from '../../../../../object/algorithm/graph/dfs';
import { CommonModule } from '@angular/common';
import { Refable, Slots } from '../../../../canvas/ref';
import DataStructureObject, { TOperation } from '../../../../../object/data-structure/dataStructure';
import CanvasLayout from '../../../../canvas/canvasLayout';
import { TreeObject } from '../../../../../object/data-structure/tree';
import { TreeComponent } from '../../../data-structure/tree/tree.component';
import HashMapObject from '../../../../../object/data-structure/hashMap';
import ArrayObject from '../../../../../object/data-structure/array';
import { HashMapComponent } from '../../../data-structure/hash-map/hash-map.component';
import { ArrayComponent } from '../../../data-structure/array/array.component';

@Component({
  selector: 'app-dfs',
  standalone: true,
  imports: [
    CommonModule,
    GraphComponent,
    TreeComponent,
    HashMapComponent,
    ArrayComponent,
  ],
  templateUrl: './dfs.component.html',
  styleUrl: './dfs.component.scss'
})
export class DfsComponent implements IAlgorithmComponent, Refable {
  @Input() value!: DFSObject;

  @ViewChild('ref1') ref1!: Refable;
  
  layout: CanvasLayout | null = null
  graph: GraphObject<string> | null = null;
  tree: TreeObject<string> | null = null;
  isVisit: HashMapObject<string, boolean> | null = null;
  result: ArrayObject<any> | null = null;

  constructor() {}

  isDisabled(node: GraphNodeObject<any>) {
    return this.isVisit?.get(node.lid) || false
  }

  onStep({ emitter, operations, data }: TStepEvent): void {
    this.graph = null
    this.tree = null
    this.isVisit = null
    this.result = null
    if (data[0] instanceof GraphObject) {
      this.graph = data[0] as GraphObject<string>;
    } else if (data[0] instanceof TreeObject) {
      this.tree = data[0] as TreeObject<string>;
    }
    if (data[1]) {
      this.isVisit = data[1] as HashMapObject<string, boolean>;
    }
    if (data[2]) {
      this.result = data[2] as ArrayObject<any>;
    }
    setTimeout(() => {
      emitter.begin()
      operations.forEach(({ event, args }) => {
        emitter.notify(event, ...args)
      })
      emitter.end()
    })
  }

  onSubmit(event: TSubmitEvent): void {
    this.graph = null
    this.tree = null
    this.isVisit = null
    this.result = null
    this.layout = null
  }

  onLayout(layout: CanvasLayout) {
    this.layout = layout.copy()
  }

  getSlots(): Slots {
    return this.ref1?.getSlots() || { inputs: [], outputs: [] }
  }
}
