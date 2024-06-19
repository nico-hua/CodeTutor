import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrayComponent } from './array/array.component';
import { Refable, Slots } from '../../canvas/ref';
import DataStructureObject from '../../../object/data-structure/dataStructure';
import { ArrayObject } from '../../../object/data-structure/array';
import { StackObject } from '../../../object/data-structure/stack';
import { QueueObject } from '../../../object/data-structure/queue';
import { StackComponent } from './stack/stack.component';
import { GraphComponent } from './graph/graph.component';
import { QueueComponent } from './queue/queue.component';
import { GraphNodeComponent } from './graph/graph-node/graph-node.component';
import GraphObject, { GraphNode, GraphNodeObject } from '../../../object/data-structure/graph';
import { RefObject } from '../../../object/data-structure/ref';
import { LiteralComponent } from './literal/literal.component';
import { RefComponent } from './ref/ref.component';
import { LinkListComponent } from './link-list/link-list.component';
import { LinkListObject } from '../../../object/data-structure/linkList';
import HashMapObject from '../../../object/data-structure/hashMap';
import { HashMapComponent } from './hash-map/hash-map.component';
import { TreeComponent } from './tree/tree.component';
import { TreeObject } from '../../../object/data-structure/tree';
import { HeapObject } from '../../../object/data-structure/heap';
import { HeapComponent } from './heap/heap.component';
import { CanvasService } from '../../canvas/canvas.service';

export interface IDataStructureComponent extends Refable {
}

@Component({
  selector: 'app-data-structure',
  standalone: true,
  imports: [
    CommonModule,
    LiteralComponent,
    RefComponent,
    ArrayComponent,
    StackComponent,
    QueueComponent,
    GraphNodeComponent,
    GraphComponent,
    LinkListComponent,
    TreeComponent,
    HeapComponent,
    HashMapComponent,
  ],
  templateUrl: './data-structure.component.html',
  styleUrl: './data-structure.component.scss'
})
export class DataStructureComponent implements IDataStructureComponent {
  @Input() value!: DataStructureObject
  @Input() readonly = false

  @ViewChild('contanierRef') contanierRef!: ElementRef<HTMLDivElement>;
  @ViewChild('objectRef') objectRef!: IDataStructureComponent;

  constructor(private canvasService: CanvasService) {}

  get ref() {
    return this.value as RefObject<any>
  }

  get literal() {
    return this.value as DataStructureObject
  }

  get array() {
    return this.value as ArrayObject<any>
  }

  get node() {
    return this.value as GraphNodeObject<any>
  }

  get graph() {
    return this.value as GraphObject<any>
  }
  get stack() {
    return this.value as StackObject<any>
  }
  get queue() {
    return this.value as QueueObject<any>
  }

  get linklist() {
    return this.value as LinkListObject<any>
  }

  get tree() {
    return this.value as TreeObject<any>
  }

  get heap() {
    return this.value as HeapObject<any>
  }

  get hashmap() {
    return this.value as HashMapObject<string, any>
  }

  onAddGraphNode() {
    const node = new GraphNodeObject(new GraphNode(String(this.canvasService.uid), ''), this.graph)
    this.graph.addNode(node)
    setTimeout(() => this.canvasService.render())
    return node
  }

  onRemoceGraphNode(node: GraphNodeObject<any>) {
    this.graph.removeNode(node)
    setTimeout(() => this.canvasService.render())
  }

  onAddGraphNodeAfter(node: GraphNodeObject<any>) {
    const newNode = this.onAddGraphNode()
    this.graph.addEdge(node.id, newNode.id)
  }

  getSlots(): Slots {
    const { left: x, top: y, width, height } = this.contanierRef.nativeElement.getBoundingClientRect()
    const { id } = this.value
    const rect = {
      id, type: 'data-structure',
      x, y, width, height,
    }
    const slots: Slots = {
      inputs: [
        {
          id, 
          x, y: y + height / 2,
          rect
        }
      ],
      outputs: []
    }

    const { inputs, outputs } = this.objectRef?.getSlots() || { inputs: [], outputs: [] }

    slots.inputs.push(...inputs.map(slot => ({ ...slot, rect })))
    slots.outputs.push(...outputs.map(slot => ({ ...slot, rect })))

    return slots
  }
}
