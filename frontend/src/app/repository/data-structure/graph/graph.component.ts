import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import GraphObject, {
  GraphNode,
  GraphNodeObject,
} from '../../../../object/data-structure/graph';
import { IDataStructureComponent } from '../data-structure.component';
import { Slot, Slots } from '../../../canvas/ref';
import { CommonModule } from '@angular/common';
import {
  GraphNodeComponent,
  InnerSlot,
  InnerSlots,
} from './graph-node/graph-node.component';
import CanvasGraph, {
  TGridLayout,
  buildGraph,
  topoSort,
} from '../../../canvas/canvasGraph';
import CanvasLayout from '../../../canvas/canvasLayout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CanvasService } from '../../../canvas/canvas.service';
import { DragService, Key, Position, Size } from '../../../drag/drag.service';
import { MatInput, MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    GraphNodeComponent,
  ],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.scss',
})
export class GraphComponent
  implements IDataStructureComponent, AfterViewInit, OnChanges
{
  @Input('value') graph!: GraphObject<any>;
  @Input('displayId') displayId!: (node: GraphNodeObject<any>) => string;
  @Input('readonly') readonly:
    | boolean
    | ((node: GraphNodeObject<any>) => boolean) = false;
  @Input('disabled') disabled:
    | boolean
    | ((node: GraphNodeObject<any>) => boolean) = false;
  @Input('linkable') linkable:
    | boolean
    | ((node: GraphNodeObject<any>) => boolean) = true;
  @Input('nodeStyle') nodeStyle:
    | Record<string, string>
    | ((node: GraphNodeObject<any>) => Record<string, string>) = {};
  @Input('addible') addible: boolean = true;
  @Input('removable') removable:
    | boolean
    | ((node: GraphNodeObject<any>) => boolean) = true;
  @Input('nodeAddible') nodeAddible:
    | boolean
    | ((node: GraphNodeObject<any>) => boolean) = true;
  @Input('showOptions') showOptions: boolean = true;
  @Input('maxIndeg') maxIndeg:
    | number
    | ((node: GraphNodeObject<any>) => number) = Number.MAX_VALUE;
  @Input('maxOutdeg') maxOutdeg:
    | number
    | ((node: GraphNodeObject<any>) => number) = Number.MAX_VALUE;
  @Input('animate') animate: boolean = false;
  @Input('layout') initLayout: CanvasLayout | null = null;
  @Input('autolayout') autolayout = true;
  @Input('layoutSorter') layoutSorter: (graph: CanvasGraph) => TGridLayout =
    topoSort;

  @Output('change') changeEmitter = new EventEmitter<GraphObject<any>>();
  @Output('layout') layoutEmitter = new EventEmitter<CanvasLayout>();
  @Output('autolayout') autolayoutEmitter = new EventEmitter<CanvasLayout>();
  @Output('resize') resizeEmitter = new EventEmitter<Size>();
  @Output('add') addEmitter = new EventEmitter();
  @Output('remove') removeEmitter = new EventEmitter<GraphNodeObject<any>>();
  @Output('addAfterNode') addAfterNodeEmitter = new EventEmitter<
    GraphNodeObject<any>
  >();

  @ViewChild('containerRef') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChildren(GraphNodeComponent) children!: QueryList<GraphNodeComponent>;
  @ViewChildren(MatInput) matInputs!: QueryList<MatInput>;

  get rect() {
    const {
      left: x,
      top: y,
      width,
      height,
    } = this.containerRef?.nativeElement.getBoundingClientRect() || {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };
    return { x, y, width, height };
  }

  constructor(
    private canvasService: CanvasService,
    private dragService: DragService
  ) {}
  private layout: CanvasLayout | null = null;
  private styleMap: Map<string, Record<string, string>> = new Map();
  minSize: Size = { width: 100, height: 50 };
  _size: Size = { width: this.minSize.width, height: this.minSize.height };

  get size() {
    return this._size;
  }

  set size(size: Size) {
    if (size.width !== this.size.width || size.height !== this.size.height) {
      this._size = {
        width: Math.max(size.width, this.minSize.width),
        height: Math.max(size.height, this.minSize.height),
      };
      this.resizeEmitter.emit(size);
    }
  }

  onGraphNodeGet(id: string, value: any) {
    if (this.animate) {
      this.styleMap.set(id, { backgroundColor: 'dodgerblue', color: 'white' });
      setTimeout(() => {
        this.styleMap.delete(id);
      }, 1000);
    }
  }
  onGraphNodeGet_b = this.onGraphNodeGet.bind(this);

  onGraphNodeUpdate(id: string, value: any) {
    if (this.animate) {
      this.styleMap.set(id, { backgroundColor: 'green' });
      setTimeout(() => {
        this.styleMap.delete(id);
      }, 1000);
    }
  }
  onGraphNodeUpdate_b = this.onGraphNodeUpdate.bind(this);

  onGraphNodeAdd(node: GraphNodeObject<any>) {
    if (this.animate) {
      this.styleMap.set(node.id, { backgroundColor: 'dodgerblue' });
      setTimeout(() => {
        this.styleMap.delete(node.id);
      }, 1000);
    }
  }
  onGraphNodeAdd_b = this.onGraphNodeAdd.bind(this);

  onGraphSuccessorsGet(id: string, successors: string[]) {
    if (this.animate) {
      this.styleMap.set(id, { backgroundColor: 'yellow' });
      setTimeout(() => {
        this.styleMap.delete(id);
      }, 1000);
      successors.forEach((successor) => {
        this.styleMap.set(successor, {
          backgroundColor: 'yellow',
          opacity: '0.3',
        });
        setTimeout(() => {
          this.styleMap.delete(successor);
        }, 1000);
      });
    }
  }
  onGraphSuccessorsGet_b = this.onGraphSuccessorsGet.bind(this);

  onGraphPredecessorsGet(id: string, predecessors: string[]) {
    if (this.animate) {
      this.styleMap.set(id, { backgroundColor: 'yellow' });
      setTimeout(() => {
        this.styleMap.delete(id);
      }, 1000);
      predecessors.forEach((predecessor) => {
        this.styleMap.set(predecessor, {
          backgroundColor: 'yellow',
          opacity: '0.3',
        });
        setTimeout(() => {
          this.styleMap.delete(predecessor);
        }, 1000);
      });
    }
  }
  onGraphPredecessorsGet_b = this.onGraphPredecessorsGet.bind(this);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graph']) {
      if (changes['graph'].previousValue) {
        (changes['graph'].previousValue as GraphObject<any>)
          .off(GraphObject.Event.GET, this.onGraphNodeGet_b)
          .off(GraphObject.Event.UPDATE, this.onGraphNodeUpdate_b)
          .on(GraphObject.Event.ADD_NODE, this.onGraphNodeAdd_b)
          .off(GraphObject.Event.GET_SUCCESSORS, this.onGraphSuccessorsGet_b)
          .off(
            GraphObject.Event.GET_PREDECESSORS,
            this.onGraphPredecessorsGet_b
          )
          .nodes.forEach((node) =>
            this.dragService.offUpdate(this.onNodePosUpdate_b, node.id)
          );
      }

      this.graph
        .on(GraphObject.Event.GET, this.onGraphNodeGet_b)
        .on(GraphObject.Event.UPDATE, this.onGraphNodeUpdate_b)
        .on(GraphObject.Event.ADD_NODE, this.onGraphNodeAdd_b)
        .on(GraphObject.Event.GET_SUCCESSORS, this.onGraphSuccessorsGet_b)
        .on(GraphObject.Event.GET_PREDECESSORS, this.onGraphPredecessorsGet_b)
        .nodes.forEach((node) =>
          this.dragService.onUpdate(this.onNodePosUpdate_b, node.id)
        );

      this.changeEmitter.emit(this.graph);

      if (this.autolayout) this.onAutoLayout();
    }
    if (changes['initLayout'] && this.initLayout) {
      this.layout = this.initLayout;
      setTimeout(() => this.canvasService.render(false));
    }
  }

  ngAfterViewInit(): void {
    this.onAutoLayout();
  }

  get showAdd() {
    return !this.readonly && this.addible;
  }

  isReadonly(node: GraphNodeObject<any>) {
    if (typeof this.readonly === 'function') {
      return this.readonly(node);
    }
    return this.readonly;
  }

  isDisabled(node: GraphNodeObject<any>) {
    if (typeof this.disabled === 'function') {
      return this.disabled(node);
    }
    return this.disabled;
  }

  isLinkable(node: GraphNodeObject<any>) {
    if (typeof this.linkable === 'function') {
      return this.linkable(node);
    }
    return this.linkable;
  }

  isNodeAddible(node: GraphNodeObject<any>) {
    let res =
      typeof this.nodeAddible === 'function'
        ? this.nodeAddible(node)
        : this.nodeAddible;
    return (
      res && this.graph.getSuccessors(node).length < this.getMaxOutdeg(node)
    );
  }

  isRemovable(node: GraphNodeObject<any>) {
    return typeof this.removable === 'function'
      ? this.removable(node)
      : this.removable;
  }

  getDisplayId(node: GraphNodeObject<any>) {
    return this.displayId?.(node) || node.lid
  }

  getMaxIndeg(node: GraphNodeObject<any>) {
    if (typeof this.maxIndeg === 'function') {
      return this.maxIndeg(node);
    }
    return this.maxIndeg;
  }

  getMaxOutdeg(node: GraphNodeObject<any>) {
    if (typeof this.maxOutdeg === 'function') {
      return this.maxOutdeg(node);
    }
    return this.maxOutdeg;
  }

  getNodeStyle(node: GraphNodeObject<any>) {
    if (typeof this.nodeStyle === 'function') {
      return this.nodeStyle(node);
    }
    return this.nodeStyle;
  }

  DefaultPos = { x: 0, y: 0 };
  getPos(id: string) {
    if (!this.layout?.has(id)) {
      this.layout?.set(id, { ...this.DefaultPos });
    }
    return this.layout?.get(id) || this.DefaultPos;
  }

  DefaultStyle = {};
  getStyle(id: string) {
    const node = this.graph?.getNode(id);
    const style = node ? this.getNodeStyle(node) || {} : {};
    return Object.assign({}, this.DefaultStyle, style, this.styleMap.get(id));
  }

  getNodeComponent(id: string) {
    return this.children.find((child) => child.node.id === id);
  }

  toStyle(size: { width: number; height: number }) {
    return {
      width: `${size.width}px`,
      height: `${size.height}px`,
    };
  }

  edges: {
    id: string;
    d: string;
    weight: number | null;
    src: string;
    tgt: string;
  }[] = [];

  updateEdges() {
    this.getInnerSlots(false);
  }
  getInnerSlots(silent = false): InnerSlots {
    const inputs: InnerSlot[] = [];
    const outputs: InnerSlot[] = [];
    this.children?.forEach((child) => {
      const innerSlots = child.getInnerSlots();
      inputs.push(...innerSlots.inputs);
      outputs.push(...innerSlots.outputs);
    });

    if (!silent) {
      const edges: typeof this.edges = [];
      const edgeMap: Map<string, Set<string>> = new Map();
      const srcPosMap: Map<String, Position> = new Map();
      const tgtPosMap: Map<String, Position> = new Map();
      inputs.forEach(({ src, tgt, x, y }) => {
        tgtPosMap.set(tgt, { x, y });
        if (!edgeMap.has(src)) edgeMap.set(src, new Set());
        edgeMap.get(src)!.add(tgt);
      });
      outputs.forEach(({ src, tgt, x, y }) => {
        srcPosMap.set(src, { x, y });
        if (!edgeMap.has(src)) edgeMap.set(src, new Set());
        edgeMap.get(src)!.add(tgt);
      });
      const { x, y } = this.rect;
      for (const [src, tgts] of edgeMap) {
        const { x: x1, y: y1 } = srcPosMap.get(src)!;
        for (const tgt of tgts) {
          const { x: x2, y: y2 } = tgtPosMap.get(tgt)!;
          edges.push({
            id: `${src}-${tgt}`,
            src,
            tgt,
            d: `M${x1 - x},${y1 - y} Q${x1 - x},${y2 - y} ${x2 - x},${y2 - y}`,
            weight: this.graph.getWeight(src, tgt),
          });
        }
      }
      this.edges = edges;
    }
    return { inputs, outputs };
  }
  getSlots(silent = false): Slots {
    const inputs: Slot[] = [];
    const outputs: Slot[] = [];
    let w = 0;
    let h = 0;

    this.children?.forEach((child) => {
      const { x, y } = child.pos;
      if (!silent) {
        const { width, height } = child.rect;
        if (x + width > w) w = x + width;
        if (y + height > h) h = y + height;
      }
      const slots = child.getSlots();

      inputs.push(...slots.inputs);
      outputs.push(...slots.outputs);
    });

    if (!silent) {
      this.updateEdges();
      this.size = { width: w, height: h + 20 };
    }
    return { inputs, outputs };
  }

  getAllSlots(): Slots {
    const slots: Slots = { inputs: [], outputs: [] };
    for (const { inputs, outputs } of [
      this.getSlots(true),
      this.getInnerSlots(true),
    ]) {
      slots.inputs.push(...inputs);
      slots.outputs.push(...outputs);
    }
    return slots;
  }

  onAdd() {
    this.addEmitter.emit();
  }

  onAddAfterNode(node: GraphNodeObject<any>) {
    this.addAfterNodeEmitter.emit(node);
  }

  private base = { x: 16, y: 16 };
  autoLayout() {
    this.layout = buildGraph(this.getAllSlots())
      .link()
      .layout({ base: this.base, sorter: this.layoutSorter });
    setTimeout(() => {
      this.canvasService.render(false);
      this.autolayoutEmitter.emit(this.layout!);
      this.layoutEmitter.emit(this.layout!);
    });
  }

  onAutoLayout() {
    this.autoLayout();
  }

  onNodePosUpdate({ key, position }: { key: Key; position: Position }) {
    this.layout!.set(String(key), position);
    this.layoutEmitter.emit(this.layout!);
  }
  onNodePosUpdate_b = this.onNodePosUpdate.bind(this);

  isEditingWeight = false;
  curWeight: number | null = null;
  weightEditorPos: Position | null = null;
  curEdge: (typeof this.edges)[0] | null = null;
  onEditWeight(event: MouseEvent, edge: (typeof this.edges)[0]) {
    if (this.readonly) return;
    event.stopPropagation();
    event.preventDefault();
    this.isEditingWeight = true;
    const { x: x0, y: y0 } = this.rect;
    const { clientX: x, clientY: y } = event;
    this.weightEditorPos = { x: x - x0, y: y - y0 };
    this.curEdge = edge;
    this.curWeight = edge.weight;
    window.addEventListener('click', this.onSaveWeight_b);
    setTimeout(() => {
      this.matInputs?.first?.focus();
    });
  }

  onSaveWeight() {
    const { src, tgt } = this.curEdge!;
    this.graph.addEdge(src, tgt, this.curWeight!);
    this.isEditingWeight = false;
    this.weightEditorPos = null;
    this.curEdge = null;
    this.curWeight = null;
    window.removeEventListener('click', this.onSaveWeight_b);
    setTimeout(() => this.updateEdges());
  }
  onSaveWeight_b = this.onSaveWeight.bind(this);

  onClickWeightEditor(event: MouseEvent) {
    event.stopPropagation();
  }
}
