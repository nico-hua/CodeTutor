import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasObjectComponent } from './canvas-object.component';
import CanvasObject from '../canvasObject';

describe('CanvasObjectComponent', () => {
  let component: CanvasObjectComponent;
  let fixture: ComponentFixture<CanvasObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasObjectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CanvasObjectComponent);
    component = fixture.componentInstance;
    component.object = new CanvasObject('test canvas object', 'test', null)
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
