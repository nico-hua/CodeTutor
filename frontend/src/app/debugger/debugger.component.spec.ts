import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebuggerComponent } from './debugger.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DebuggerComponent', () => {
  let component: DebuggerComponent;
  let fixture: ComponentFixture<DebuggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebuggerComponent, HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DebuggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
