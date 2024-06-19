import { NgFor } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button'
import { Router } from '@angular/router';
import ace from 'ace-builds'
@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [
    NgFor, 
    FormsModule,
    MatSliderModule,
    MatButtonModule,
  ],
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent implements OnChanges, AfterViewInit {
  @Input() code: string = '';
  @Input() curLine: number = 0;
  @Input() curStep: number = 0;
  @Input() minStep: number = 0;
  @Input() maxStep: number = 0;
  @Output() submit = new EventEmitter<string>()
  @Output() goto = new EventEmitter<number>()
  
  private editor: ace.Ace.Editor | null = null
  constructor( private router: Router) {}
  
  value: string = ''
  
  lines: string[] = []
  
  get disabled() {
    return !(this.minStep < this.maxStep) 
  }
  
  isCurrent(index: number): boolean {
    return index === this.curLine
  }
  
  stepLabel(step: number) {
    return `${step}`
  }
  
  ngAfterViewInit(): void {
    ace.config.set('basePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.34.0/src-min-noconflict/');

    this.editor = ace.edit('editor', {
      mode: 'ace/mode/python',
    })
    this.editor.setValue(this.code)
    this.editor.clearSelection()
    this.editor.moveCursorTo(0, 0)
    this.editor.setFontSize(16)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code']&& this.editor) {
      // this.value = changes['code'].currentValue
      // this.lines = this.value.split('\n')
      this.value = changes['code'].currentValue;
      this.editor!.setValue(this.value); // Update the editor with new code
      this.editor!.clearSelection();
      this.lines = this.value.split('\n')
    }
    if (changes['curLine']) {
      this.editor?.clearSelection()
      this.editor?.moveCursorTo(this.curLine - 1, 0)
    }
  }

  onSubmit(): void {
    this.value = this.editor?.getValue() ?? ''
    this.submit.emit(this.value)
  }

  goToHistory() {
    this.router.navigate(['/history']);
  }

  onPrev() {
    this.goto.emit((this.curStep + this.maxStep) % (this.maxStep + 1))
  }

  onNext() {
    this.goto.emit((this.curStep + 1) % (this.maxStep + 1))
  }

  onGoto(step: number) {
    this.goto.emit(step - 1)
  }
}
