import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { IDataStructureComponent } from '../data-structure.component';
import { Slots } from '../../../canvas/ref';
import {
  TreeNodeObject,
  TreeObject,
} from '../../../../object/data-structure/tree';
import { GraphComponent } from '../graph/graph.component';
import { GraphNodeObject } from '../../../../object/data-structure/graph';
import { Size } from '../../../drag/drag.service';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasService } from '../../../canvas/canvas.service';
import { CommonModule } from '@angular/common';
import { treeSort } from '../../../canvas/canvasGraph';

@Component({
  selector: 'app-tree',
  standalone: true,
  imports: [CommonModule, GraphComponent, MatSliderModule],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
})
export class TreeComponent implements IDataStructureComponent, OnChanges {
  @Input('value') tree!: TreeObject<any>;
  @Input('displayId') displayId?: (node: TreeNodeObject<any>) => string;
  @Input('branch') initBranch: number = 2;
  @Input('readonly') readonly = false;
  @Input('linkable') linkable = true;
  @Input('addible') addible = true;
  @Input('nodeStyle') nodeStyle: (
    node: TreeNodeObject<any>
  ) => Record<string, string> = () => ({});
  @Input('showOptions') showOptions = true;
  @Input('animate') animate = false;

  @Output('resize') resizeEmitter = new EventEmitter<Size>();

  @ViewChild('graphRef') graphRef!: GraphComponent;

  constructor(private canvasService: CanvasService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tree']) {
      const prev = changes['tree'].previousValue as TreeObject<any>;
      if (prev) {
        prev
          .off(TreeObject.Event.GET, this.onTreeGet_b)
          .off(TreeObject.Event.UPDATE, this.onTreeUpdate_b)
          .off(TreeObject.Event.ADD, this.onTreeAdd_b)
          .off(TreeObject.Event.REMOVE, this.onTreeRemove_b)
          .off(TreeObject.Event.COMPARE, this.onTreeCompare_b)
          .off(TreeObject.Event.SWAP, this.onTreeSwap_b);
      }
      this.tree
        .on(TreeObject.Event.GET, this.onTreeGet_b)
        .on(TreeObject.Event.UPDATE, this.onTreeUpdate_b)
        .on(TreeObject.Event.ADD, this.onTreeAdd_b)
        .on(TreeObject.Event.REMOVE, this.onTreeRemove_b)
        .on(TreeObject.Event.COMPARE, this.onTreeCompare_b)
        .on(TreeObject.Event.SWAP, this.onTreeSwap_b);
    }

    if (changes['initBranch']) {
      this.branch = this.initBranch;
      this.tree.setBranch(this.initBranch, true);
    }
  }

  onTreeGet(node: TreeNodeObject<any>, v: any) {
    if (this.animate) {
      this.styleMap.set(node.lid, {
        backgroundColor: 'dodgerblue',
        color: 'white',
      });
      setTimeout(() => this.styleMap.delete(node.lid), 1000);
    }
  }
  onTreeGet_b = this.onTreeGet.bind(this);

  onTreeUpdate(node: TreeNodeObject<any>, v: any, vold: any) {
    if (this.animate) {
      this.styleMap.set(node.lid, { backgroundColor: 'green', color: 'white' });
      setTimeout(() => this.styleMap.delete(node.lid), 1000);
    }
  }
  onTreeUpdate_b = this.onTreeUpdate.bind(this);

  onTreeAdd(node: TreeNodeObject<any>, parent: TreeNodeObject<any> | null) {
    if (this.animate) {
      this.styleMap.set(node.lid, { backgroundColor: 'green', color: 'white' });
      setTimeout(() => this.styleMap.delete(node.lid), 1000);
    }
  }
  onTreeAdd_b = this.onTreeAdd.bind(this);

  onTreeRemove(node: TreeNodeObject<any>, parent: TreeNodeObject<any> | null) {
    if (this.animate) {
      this.styleMap.set(node.lid, { backgroundColor: 'green', color: 'white' });
      setTimeout(() => this.styleMap.delete(node.lid), 1000);
    }
  }
  onTreeRemove_b = this.onTreeRemove.bind(this);

  onTreeCompare(
    node1: TreeNodeObject<any>,
    node2: TreeNodeObject<any>,
    res: boolean
  ) {
    if (this.animate) {
      const color = res ? 'green' : 'red';
      this.styleMap.set(node1.lid, { backgroundColor: color, color: 'while' });
      this.styleMap.set(node2.lid, { backgroundColor: color, color: 'while' });
      setTimeout(() => {
        this.styleMap.delete(node1.lid);
        this.styleMap.delete(node2.lid);
      }, 1000);
    }
  }
  onTreeCompare_b = this.onTreeCompare.bind(this);

  onTreeSwap(node1: TreeNodeObject<any>, node2: TreeNodeObject<any>) {
    if (this.animate) {
      this.styleMap.set(node1.lid, { backgroundColor: 'yellow' });
      this.styleMap.set(node2.lid, { backgroundColor: 'yellow' });
      setTimeout(() => {
        this.styleMap.delete(node1.lid);
        this.styleMap.delete(node2.lid);
      }, 1000);
    }
  }
  onTreeSwap_b = this.onTreeSwap.bind(this);

  private styleMap: Map<string, Record<string, string>> = new Map();
  getNodeStyle(node: GraphNodeObject<any>) {
    return Object.assign(
      this.nodeStyle(this.tree.nodeTransMap.get(node)!),
      this.styleMap.get(node.lid)
    );
  }

  isDisabled(node: GraphNodeObject<any>) {
    return false;
  }

  isRemovable(node: GraphNodeObject<any>) {
    return this.tree.nodeTransMap.get(node)?.children.length === 0 || false;
  }

  getDisplayId(node: GraphNodeObject<any>) {
    return this.displayId?.(this.tree.nodeTransMap.get(node)!) ?? node.lid;
  }

  getMaxIndeg = (node: GraphNodeObject<any>) => {
    return 1;
  };

  treelayoutSorter = treeSort;

  getGetMaxOutdeg = () => (node: GraphNodeObject<any>) => {
    const { branch } = this.tree;
    if (typeof branch === 'function') {
      return branch(this.tree.nodeTransMap.get(node)!);
    }
    return branch;
  };
  getMaxOutdeg = this.getGetMaxOutdeg();

  private _size: Size = { width: 0, height: 0 };
  onResize(size: Size) {
    this._size = size;
    this.resizeEmitter.emit(size);
  }

  branch: number = 2;
  onUpdateBranch(branch: number) {
    const oldBranch = this.branch;
    this.branch = branch;
    if (this.tree.setBranch(branch)) {
      this.getMaxOutdeg = this.getGetMaxOutdeg();
    } else {
      setTimeout(() => (this.branch = oldBranch));
    }
  }

  branchDisplay(branch: number) {
    return `${branch}branch`;
  }

  getSlots(): Slots {
    return this.graphRef.getSlots();
  }

  autoLayout() {
    this.graphRef.autoLayout();
  }

  onAdd() {
    const id = String(this.canvasService.uid);
    this.tree.insert(new TreeNodeObject(id, '', this.tree));
    setTimeout(() => this.canvasService.render(false));
  }

  onRemove(node: GraphNodeObject<any>) {
    this.tree.remove(this.tree.nodeTransMap.get(node)!);
    setTimeout(() => {
      this.graphRef.autoLayout();
      this.canvasService.render(false);
    });
  }

  onAddAfterNode(node: GraphNodeObject<any>) {
    const id = String(this.canvasService.uid);
    this.tree.insert(
      new TreeNodeObject(id, '', this.tree),
      this.tree.nodeTransMap.get(node)!
    );
    setTimeout(() => {
      this.graphRef.autoLayout();
      this.canvasService.render(false);
    });
  }
}
