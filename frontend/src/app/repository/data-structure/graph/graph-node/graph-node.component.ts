import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CellComponent } from '../../cell/cell.component';
import { GraphNodeObject } from '../../../../../object/data-structure/graph';
import { IDataStructureComponent } from '../../data-structure.component';
import { Position, Rect, Slot, Slots } from '../../../../canvas/ref';
import { GraphComponent } from '../graph.component';
import { CanvasService } from '../../../../canvas/canvas.service';
import { DraggableItemComponent } from '../../../../drag/draggable-item/draggable-item.component';
import { DragIconComponent } from '../../../../canvas/drag-icon/drag-icon.component';
import { CommonModule } from '@angular/common';

export type InnerSlot = { src: string; tgt: string } & Slot;
export type InnerSlots = { inputs: InnerSlot[]; outputs: InnerSlot[] };

@Component({
  selector: 'app-graph-node',
  standalone: true,
  imports: [
    CommonModule,
    CellComponent,
    DragIconComponent,
    DraggableItemComponent,
  ],
  templateUrl: './graph-node.component.html',
  styleUrl: './graph-node.component.scss',
})
export class GraphNodeComponent implements IDataStructureComponent {
  @Input('value') node!: GraphNodeObject<any>;
  @Input() displayId!: string;
  @Input() readonly = false;
  @Input() linkable = true;
  @Input() disabled = false;
  @Input() addible = false;
  @Input() removable = false;
  @Input() maxIndeg = Number.MAX_VALUE;
  @Input() maxOutdeg = Number.MAX_VALUE;
  @Input() parent!: GraphComponent;
  @Input() initialPosition!: Position;
  @Input() style = {};

  @Output('add') addEmitter = new EventEmitter<GraphNodeObject<any>>() 

  @ViewChild('container') containerRef!: ElementRef<HTMLElement>;
  @ViewChild('in') inRef!: ElementRef<HTMLElement>;
  @ViewChild('out') outRef!: ElementRef<HTMLElement>;
  @ViewChild('itemRef') itemRef!: DraggableItemComponent;
  @ViewChild('cellRef') cellRef!: CellComponent;

  private cursor: Position | null = null;

  constructor(private canvasService: CanvasService) {}

  get graph() {
    return this.parent.graph;
  }

  get pos() {
    return this.itemRef.pos || this.initialPosition;
  }

  get rect() {
    return this.containerRef.nativeElement.getBoundingClientRect();
  }

  get inRect() {
    return this.inRef.nativeElement.getBoundingClientRect();
  }

  get outRect() {
    return this.outRef.nativeElement.getBoundingClientRect();
  }

  getInnerSlots(): InnerSlots {
    const { id } = this.node;
    const { graph } = this;

    const inputs: InnerSlot[] = [];
    const outputs: InnerSlot[] = [];

    const { x, y, width, height } = this.rect;
    const rect: Rect = {
      id,
      type: 'node',
      x,
      y,
      width,
      height,
    };

    const { x: x1, y: y1, width: w1, height: h1 } = this.inRect;
    graph.getPredecessors(id).forEach((node) => {
      inputs.push({
        id: `${node.id}-${id}`,
        src: node.id,
        tgt: id,
        x: x1 + w1 / 2,
        y: y1 + h1 / 2,
        rect
      });
    });

    const { x: x2, y: y2, width: w2, height: h2 } = this.outRect;
    graph.getSuccessors(id).forEach((node) => {
      outputs.push({
        id: `${id}-${node.id}`,
        src: id,
        tgt: node.id,
        x: x2 + w2 / 2,
        y: y2 + h2 / 2,
        rect
      });
    });

    return { inputs, outputs };
  }

  getSlots(): Slots {
    const { id } = this.node;
    const { graph } = this;

    const inputs: Slot[] = [];
    const outputs: Slot[] = [];

    const { x, y, width, height } = this.rect;
    const rect: Rect = {
      id,
      type: 'node',
      x,
      y,
      width,
      height,
    };

    const { x: x1, y: y1, width: w1, height: h1 } = this.inRect;
    inputs.push({
      id,
      x: x1 + w1 / 2,
      y: y1 + h1 / 2,
      rect,
    });

    const { x: x2, y: y2, width: w2, height: h2 } = this.outRect;

    if (this.cursor) {
      outputs.push({
        id: 'cursor',
        x: x2 + w2 / 2,
        y: y2 + h2 / 2,
        rect,
      });
      inputs.push({
        id: 'cursor',
        ...this.cursor,
      });
    }

    const slots = this.cellRef.getSlots();
    inputs.push(...slots.inputs);
    outputs.push(...slots.outputs);

    return { inputs, outputs };
  }

  onRemove() {
    this.parent.removeEmitter.emit(this.node)
  }

  onAdd(node: GraphNodeObject<any>) {
    this.addEmitter.emit(node)
  }

  onSave(value: string) {
    this.node.value = value;
  }

  get addSuccDisabled() {
    return (
      !this.linkable ||
      this.readonly ||
      this.graph.getSuccessors(this.node).length >= this.maxOutdeg
    );
  }

  get removePredDisabled() {
    return (
      !this.linkable ||
      this.readonly ||
      this.graph.getPredecessors(this.node).length <= 0
    );
  }

  onInMouseDown(event: MouseEvent) {
    if (this.removePredDisabled) return;
    const predecessors = this.graph.getPredecessors(this.node);
    if (predecessors.length === 0) return;
    const { id } = predecessors[0];
    this.graph.removeEdge(id, this.node.id);
    const nodeComponent = this.parent.getNodeComponent(id)!;
    nodeComponent.onOutMouseDown(event);
  }

  onOutMouseDown(event: MouseEvent) {
    if (this.addSuccDisabled) return;
    event.stopPropagation();
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', this.onMouseMove_b, true);
    window.addEventListener('mouseup', this.onOutMouseUp_b, true);
  }

  onOutMouseUp(event: MouseEvent) {
    const { clientX: x, clientY: y } = event;
    const {
      graph,
      canvasService,
      node: { id },
    } = this;
    // todo
    for (const node of canvasService.intersect(
      { x, y },
      1,
      [...graph.nodes].map((node) => node.id).filter((nodeId) => nodeId !== id)
    )) {
      if (
        graph.getPredecessors(node).length <
        this.parent.getNodeComponent(node)!.maxIndeg
      ) {
        graph.addEdge(id, node);
        break;
      }
    }
    this.cursor = null;
    canvasService.render(false);
    document.body.style.userSelect = 'default';
    window.removeEventListener('mousemove', this.onMouseMove_b, true);
    window.removeEventListener('mouseup', this.onOutMouseUp_b, true);
  }
  onOutMouseUp_b = this.onOutMouseUp.bind(this);

  onMouseMove(event: MouseEvent) {
    const { clientX: x, clientY: y } = event;
    this.cursor = { x, y };
    this.canvasService.render(false);
  }
  onMouseMove_b = this.onMouseMove.bind(this);
}
