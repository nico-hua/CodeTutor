import { Component, Input, OnChanges, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { StackComponent } from './stack/stack.component';
import { Refable, Slots } from '../../../canvas/ref';
import { ItemVariable } from '../../variable';
import { CommonModule } from '@angular/common';
import { NestedTreeControl } from '@angular/cdk/tree';
import {
  MatTreeModule,
  MatTreeNestedDataSource,
} from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { RuntimeService } from '../runtime.service';
import { MatButtonModule } from '@angular/material/button';

export type Frame = {
  name: string;
  items: ItemVariable[];
  isCurrent: boolean;
};

type FrameNode = {
  frame: Frame;
  index: number;
  children: FrameNode[];
}

@Component({
  selector: 'app-frame',
  standalone: true,
  imports: [
    CommonModule, 
    StackComponent,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './frame.component.html',
  styleUrl: './frame.component.scss',
})
export class FrameComponent implements Refable, OnChanges {
  @Input() frames!: Frame[];

  @ViewChildren(StackComponent) stackRefs!: QueryList<StackComponent>;

  node: FrameNode | null = null
  treeControl: NestedTreeControl<FrameNode>
  dataSource: MatTreeNestedDataSource<FrameNode>

  constructor(private runtimeService: RuntimeService) {
    this.treeControl = new NestedTreeControl<FrameNode>(
      node => node.children,
    );

    this.dataSource = new MatTreeNestedDataSource<FrameNode>();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['frames']) {
      if (this.frames.length > 0) {
        let cur: FrameNode | null = null
        for (let i = 0; i < this.frames.length; i++) {
          const node = {
            frame: this.frames[i],
            index: i,
            children: []
          }
          if (cur) {
            cur.children = [node]
          } else {
            this.node = node
          }
          cur = node
        }
        this.dataSource.data = [this.node!]
      } else {
        this.dataSource.data = []
      }
    }
  }

  hasChild = (_: number, node: FrameNode) => !!node.children && node.children.length > 0;

  onNodeToggle(node: FrameNode) {
    setTimeout(() => this.runtimeService.render())
  } 

  getSlots(): Slots {
    const slots: Slots = { inputs: [], outputs: [] }
    this.stackRefs.forEach(stack => {
      const { inputs, outputs } = stack.getSlots()
      slots.inputs.push(...inputs)
      slots.outputs.push(...outputs)
    })
    return slots;
  }
}
