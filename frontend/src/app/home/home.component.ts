import { Component, ElementRef, Renderer2, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { RepositoryComponent } from '../repository/repository.component';
import { HistoryComponent } from '../debugger/history/history.component'
import { DebuggerComponent } from '../debugger/debugger.component';
import { PageOneComponent } from './page-one/page-one.component';
import { PageTwoComponent } from './page-two/page-two.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RepositoryComponent,
    DebuggerComponent,
    HistoryComponent,
    PageOneComponent,
    PageTwoComponent,
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('buttonOne', {static: true}) buttonOne!: ElementRef;
  @ViewChild('buttonTwo', {static: true}) buttonTwo!: ElementRef;

  constructor(private renderer: Renderer2) {}

  showPageOne = true;
  intervalId: any;
  isPaused = false;

  ngOnInit() {
    // 每5秒切换一次页面
    this.startAutoSwitch();

    // 初始化按钮样式
    this.updateButtonStylesForPageOne();
  }

  ngOnDestroy() {
    // 清除定时器
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startAutoSwitch() {
    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.showPageOne = !this.showPageOne;
        if (this.showPageOne) {
          this.updateButtonStylesForPageOne();
        } else {
          this.updateButtonStylesForPageTwo();
        }
      }
    }, 5000);
  }

  pauseAutoSwitch() {
    this.isPaused = true;
  }

  resumeAutoSwitch() {
    this.isPaused = false;
  }

  togglePageOne() {
    this.showPageOne = true;
    this.updateButtonStylesForPageOne();
  }

  togglePageTwo() {
    this.showPageOne = false;
    this.updateButtonStylesForPageTwo();
  }

  private updateButtonStylesForPageOne() {
    this.renderer.setStyle(this.buttonOne.nativeElement, 'background-color', 'cornflowerblue');
    this.renderer.setStyle(this.buttonTwo.nativeElement, 'background-color', 'rgb(234, 231, 231)');
  }

  private updateButtonStylesForPageTwo() {
    this.renderer.setStyle(this.buttonOne.nativeElement, 'background-color', 'rgb(234, 231, 231)');
    this.renderer.setStyle(this.buttonTwo.nativeElement, 'background-color', 'cornflowerblue');
  }
}
