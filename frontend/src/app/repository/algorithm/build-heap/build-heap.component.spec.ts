import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildHeapComponent } from './build-heap.component';

describe('BuildHeapComponent', () => {
  let component: BuildHeapComponent;
  let fixture: ComponentFixture<BuildHeapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildHeapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuildHeapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
