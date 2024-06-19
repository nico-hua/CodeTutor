import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CodeService } from '../../service/code.service';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { RuntimeViewComponent } from './runtime-view/runtime-view.component';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import Tracer from './tracer';
import { Frame } from './runtime-view/frame/frame.component';
import { Variable } from './variable';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoomControlComponent } from './room-control/room-control.component';

@Component({
  selector: 'app-debugger',
  standalone: true,
  imports: [
    CodeEditorComponent,
    RuntimeViewComponent,
    RoomControlComponent,
    AlertDialogComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './debugger.component.html',
  styleUrls: ['./debugger.component.scss']
})
export class DebuggerComponent {
  code = 
`# 示例代码
myList = (1, (2, (3, (4, (5, None)))))
def sumList(node, subtotal):
  if not node:
    return subtotal
  else:
    return sumList(node[1], subtotal + node[0])
  
total = sumList(myList, 0)
`;
  

  codeService = inject(CodeService);

  tracer!: Tracer;
  _frames: Frame[] = []
  _objects: Variable<any>[] = []
  url: string = ''
  isRoomControlVisible: boolean = false;

  constructor(private dialog: MatDialog, private router: Router) {}

  get curLine() {
    return this.tracer?.curLine || -1;
  }

  get curStep() {
    return this.tracer?.curStep;
  }

  get frames() {
    return this._frames
  }

  get objects() {
    return this._objects
  }

  onSubmit(e: string): void {
    this.codeService.getTrace(e).then((res) => {
      const { code, errorMessage, data } = res;
      if (code === 200) {
        const { trace: traces } = data!;
        this.tracer = new Tracer(traces);
        this.onGoto(0);
      } else {
        // console.error(errorMessage);
        this.dialog.open(AlertDialogComponent, {
          data: { message: errorMessage+",请重新登录" },
          width: '300px',  // 设置宽度
          height: '200px'  // 设置高度
        });
      }
    });
  }

  

  get minStep(): number {
    return this.tracer?.minStep || 0;
  }

  get maxStep(): number {
    return this.tracer?.maxStep || 0;
  }

  onGoto(step: number): void {
    if (this.tracer === undefined) {
      console.warn('tracer is undefined');
      return;
    }
    this.tracer!.goto(step);
    this._frames = this.tracer!.frames
    this._objects = this.tracer!.objects
  }

  onJoinRoom(message: string) {
    this.dialog.open(AlertDialogComponent, {
      data: { message: message },
      width: '300px',  // 设置宽度
      height: '200px'  // 设置高度
    });
    return;
  }

  fetchData(e: string):void {
    if(e.trim()==''){
      this.dialog.open(AlertDialogComponent, {
        data: { message:"代码URL为空" },
        width: '300px',  // 设置宽度
        height: '200px'  // 设置高度
      });
    }
    else{
      this.codeService.getTraceByUrl(e).then((res) => {
        const { code, errorMessage, data } = res;
        if (code === 200) {
          this.code = data!.code
          //console.log(this.code)
          const { trace: traces } = data!;
          this.tracer = new Tracer(traces);
          this.onGoto(0);
        }
        else if(code === 500 || code === 501){
          this.dialog.open(AlertDialogComponent, {
            data: { message: errorMessage },
            width: '300px',  // 设置宽度
            height: '200px'  // 设置高度
          });
        } 
        else {
          // console.error(errorMessage);
          this.dialog.open(AlertDialogComponent, {
            data: { message: errorMessage+",请重新登录" },
            width: '300px',  // 设置宽度
            height: '200px'  // 设置高度
          });
        }
      });
    }
  }

  toggleRoomControl() {
    this.isRoomControlVisible = !this.isRoomControlVisible;
    //console.log(this.isRoomControlVisible)
  }

}