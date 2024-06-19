import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableItemComponent } from './draggable-item.component';

describe('DraggableItemComponent', () => {
  let component: DraggableItemComponent;
  let fixture: ComponentFixture<DraggableItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraggableItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DraggableItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
