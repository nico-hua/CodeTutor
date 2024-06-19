import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeapSortComponent } from './heap.component';

describe('HeapComponent', () => {
  let component: HeapSortComponent;
  let fixture: ComponentFixture<HeapSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeapSortComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeapSortComponent);
    component = fixture.componentInstance
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
