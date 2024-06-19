import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphComponent } from './graph.component';
import GraphObject from '../../../../object/data-structure/graph';

describe('GraphComponent', () => {
  let component: GraphComponent;
  let fixture: ComponentFixture<GraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GraphComponent);
    component = fixture.componentInstance;
    component.autolayout = false
    component.graph = new GraphObject('test graph')

    spyOn(component, 'autoLayout').and.callFake(() => {})
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
