import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Frame, FrameComponent } from './frame/frame.component';
import { CommonModule } from '@angular/common';
import { Position, Slot } from '../../canvas/ref';
import { Variable } from '../variable';
import { HeapComponent } from './heap/heap.component';
import CanvasLayout from '../../canvas/canvasLayout';
import { Size } from '../../drag/drag.service';
import { CanvasPanelComponent } from '../../canvas/canvas-panel/canvas-panel.component';
import { ItemGroupInfos, Items } from '../../repository/repository.component';
import { RuntimeService } from './runtime.service';

type Path = {
  from: Position;
  to: Position;
}
@Component({
  selector: 'app-runtime-view',
  standalone: true,
  imports: [
    CommonModule, 
    FrameComponent, 
    HeapComponent,
    CanvasPanelComponent,
  ],
  providers: [RuntimeService],
  templateUrl: './runtime-view.component.html',
  styleUrl: './runtime-view.component.scss'
})
export class RuntimeViewComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() frames: Frame[] = []
  @Input() objects: Variable<any>[] = []
  
  @ViewChild('container') container!: ElementRef;
  @ViewChild('frameRef') frameRef!: FrameComponent
  @ViewChild('heapRef') heapRef!: HeapComponent
  @ViewChild('draftRef') draftRef!: HeapComponent
  
  viewInitialed = false
  base: Position | null = null
  refPaths: Path[] = []

  showDraft = false

  layout: CanvasLayout | null = null

  size: Size = {
    width: 0,
    height: 0
  }

  panelItems = Items
  panelItemGroupInfos = ItemGroupInfos

  calcOffset(pos: Position) {
    if (!this.base) return pos
    return {
      x: pos.x - this.base.x,
      y: pos.y - this.base.y
    }
  }

  /**
   *
   * todo 贝塞尔曲线
   * @param {Path} path 路径的两个端点
   * @return {*}  返回给 svg 元素的 d 属性
   */
  calcPath(path: Path): string {
    const { from, to } = path
    const d = `M${from.x},${from.y} Q${to.x},${from.y} ${to.x},${to.y}`
    return d
  }

  render() {
    const containerRect = this.container.nativeElement.getBoundingClientRect()
    this.base = {
      x: containerRect.left,
      y: containerRect.top
    }

    this.refPaths.length = 0

    const destMap = new Map<string, Position[]>()
    const inputs: Slot[] = []
    const outputs: Slot[] = []
    // 将输出端点存入 fromMap
    outputs.push(...this.frameRef?.getSlots().outputs || [])
    // 根据 id 建立连接
    const slots = this.heapRef.getSlots()
    inputs.push(...slots.inputs)
    outputs.push(...slots.outputs)
    
    for (const output of outputs) {
      const id = output.id + ''
      if (!destMap.has(id)) {
        destMap.set(id, [])
      }
      destMap.get(id)!.push(this.calcOffset(output))
    }
    for (const input of inputs) {
      const tos = destMap.get(input.id + '')
      for (const to of tos || []) {
        if (to) {
          const from = this.calcOffset(input)
          this.refPaths.push({ from, to })
        }
      }
      
    }
  }
  render_b = this.render.bind(this)

  constructor(private runtimeService: RuntimeService) {
    runtimeService.register(this)
  }

  ngOnInit(): void {
    window.addEventListener('resize', this.render_b)
  }

  ngAfterViewInit(): void {
    this.viewInitialed = true
    new ResizeObserver(entries => {
      entries.forEach(entry => {
        const { width, height } = entry.contentRect;
        this.svgSize = { width, height }
      });
    }).observe(this.container.nativeElement);
    this.render()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['frames'] && !changes['frames'].firstChange) {
      this.render()
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.render_b)
  }

  onDblClick(event: MouseEvent) {
    this.showDraft = !this.showDraft
    event.preventDefault()
  }

  onLayout(layout: CanvasLayout) {
    this.layout = layout
    this.render()
  }

  onResize(size: Size) {
    this.size = size
  }

  svgSize: Size = { width: 0, height: 0 }

  get canvasHandler() {
    return this.draftRef?.canvasHandler
  }

  showPanel = false
  onTogglePanel() {
    this.showPanel = !this.showPanel
  }
}
