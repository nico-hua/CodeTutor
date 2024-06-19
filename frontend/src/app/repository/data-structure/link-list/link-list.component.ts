import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IDataStructureComponent } from '../data-structure.component';
import { Slots } from '../../../canvas/ref';
import { LinkListNodeObject, LinkListObject } from '../../../../object/data-structure/linkList';
import { GraphComponent } from '../graph/graph.component';
import { GraphNodeObject } from '../../../../object/data-structure/graph';
import { Size } from '../../../drag/drag.service';
import { CanvasService } from '../../../canvas/canvas.service';

@Component({
  selector: 'app-link-list',
  standalone: true,
  imports: [
    GraphComponent
  ],
  templateUrl: './link-list.component.html',
  styleUrl: './link-list.component.scss'
})
export class LinkListComponent implements IDataStructureComponent {
  @Input('value') list!: LinkListObject<any>
  @Input('readonly') readonly = false
  @Input('linkable') linkable = true
  @Input('addible') addible: boolean = true;
  @Input('showOptions') showOptions: boolean = true;
  @Input('animate') animate: boolean = false;

  @Output('resize') resizeEmitter = new EventEmitter<Size>()

  @ViewChild('graphRef') graphRef!: GraphComponent

  constructor(private canvasService: CanvasService) {}

  get headRect() {
    for (const com of this.graphRef.children) {
      if (com.node.value === null) {
        return com.inRect
      }
    }
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  private _size: Size = { width: 0, height: 0 }
  get size() {
    return this._size
  }

  autoLayout() {
    this.graphRef.autoLayout()
  }

  onResize(size: Size) {
    this._size = size
    this.resizeEmitter.emit(size)
  }

  onAdd() {
    const id = String(this.canvasService.uid);
    this.list.insert(new LinkListNodeObject(id, '', this.list))
    setTimeout(() => this.canvasService.render(false))
  }

  onRemove(node: GraphNodeObject<any>) {
    this.list.remove(this.list.nodeTransMap.get(node)!)
    setTimeout(() => {
      this.graphRef.autoLayout() 
      this.canvasService.render(false)
    })
  }

  onAddAfterNode(node: GraphNodeObject<any>) {
    const id = String(this.canvasService.uid);
    this.list.insert(new LinkListNodeObject(id, '', this.list), this.list.nodeTransMap.get(node)!)
    setTimeout(() => {
      this.graphRef.autoLayout() 
      this.canvasService.render(false)
    })
  } 
  
  isDisabled(node: GraphNodeObject<any>) {
    return node.value === null
  }

  getMaxIndeg(node: GraphNodeObject<any>) {
    if (node.value === null) return 0
    return 1
  }

  getMaxOutdeg(node: GraphNodeObject<any>) {
    return 1
  }

  getSlots(): Slots {
    return this.graphRef.getSlots()
  }
}
