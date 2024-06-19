import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeapComponent } from './heap.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HeapObject } from '../../../../object/data-structure/heap';

describe('HeapComponent', () => {
  let component: HeapComponent;
  let fixture: ComponentFixture<HeapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeapComponent, NoopAnimationsModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeapComponent);
    component = fixture.componentInstance;
    component.heap = new HeapObject('test');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
