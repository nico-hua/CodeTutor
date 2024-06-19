import { Component, Input, ViewChild } from '@angular/core';
import { IAlgorithmComponent } from '../algorithm.component';
import { TStepEvent, TSubmitEvent } from '../algorithm-base/algorithm-base.component';
import { DijkstraObject } from '../../../../object/algorithm/graph/dijkstra';
import GraphObject, { GraphNodeObject } from '../../../../object/data-structure/graph';
import { GraphComponent } from '../../data-structure/graph/graph.component';
import { CommonModule } from '@angular/common';
import HashMapObject from '../../../../object/data-structure/hashMap';
import { HashMapComponent } from '../../data-structure/hash-map/hash-map.component';
import { Slots } from '../../../canvas/ref';
import { HeapObject } from '../../../../object/data-structure/heap';
import { HeapComponent } from '../../data-structure/heap/heap.component';
import DataStructureObject from '../../../../object/data-structure/dataStructure';

@Component({
  selector: 'app-dijkstra',
  standalone: true,
  imports: [
    CommonModule,
    GraphComponent,
    HeapComponent,
    HashMapComponent,
  ],
  templateUrl: './dijkstra.component.html',
  styleUrl: './dijkstra.component.scss'
})
export class DijkstraComponent implements IAlgorithmComponent {
  @Input('value') dijkstra!: DijkstraObject

  @ViewChild('graphRef') graphRef!: GraphComponent
  @ViewChild('pqRef') pqRef!: HeapComponent
  @ViewChild('mapRef') mapRef!: HashMapComponent

  emitter: DataStructureObject | null = null
  graph: GraphObject<any> | null = null
  src: GraphNodeObject<any> | null = null
  pq: HeapObject<any> | null = null
  distMap: HashMapObject<string, number> | null = null

  onStep({ data, operations, emitter }: TStepEvent): void {
    this.graph = data[0] as GraphObject<any>
    this.distMap = null
    this.pq = null
    this.emitter = emitter  

    if (data[1]) {
      if (data[1] instanceof HeapObject) {
        this.pq = data[1] as HeapObject<any>
      } else {
        this.src = data[1] as GraphNodeObject<any>
      }
    }
    if (data[2]) {
      this.distMap = data[2] as HashMapObject<string, number>
    }

    setTimeout(() => {
      emitter.begin()
      operations.forEach(({ event, args }) => emitter.notify(event, ...args))
      emitter.end()
    })
  }

  onSubmit(event: TSubmitEvent): void {
    this.graph = null
    this.distMap = null
    this.pq = null
    this.emitter = null
  }

  getSlots(): Slots {
    const slots: Slots = { inputs: [], outputs: [] };
  
    for (const ref of [this.graphRef, this.pqRef, this.mapRef]) {
      if (!ref) continue
      const { inputs, outputs } = ref.getSlots();
      slots.inputs.push(...inputs);
      slots.outputs.push(...outputs);
    }
  
    return slots;
  }

  getNodeStyle(node: GraphNodeObject<any>): Record<string, string> {
    if (node.lid === this.src?.lid) {
      return {
        backgroundColor: 'dodgerblue',
      }
    }
    return {}
  }

  isCurrent(data: DataStructureObject) {
    return data === this.emitter
  }
}
