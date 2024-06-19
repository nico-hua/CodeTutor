import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasPanelComponent } from './canvas-panel.component';

describe('CanvasPanelComponent', () => {
  let component: CanvasPanelComponent;
  let fixture: ComponentFixture<CanvasPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CanvasPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
