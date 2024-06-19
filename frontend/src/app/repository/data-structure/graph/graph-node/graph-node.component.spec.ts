import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphNodeComponent } from './graph-node.component';
import GraphObject, { GraphNode, GraphNodeObject } from '../../../../../object/data-structure/graph';
import { GraphComponent } from '../graph.component';

describe('GraphNodeComponent', () => {
  let parent: GraphComponent;
  let component: GraphNodeComponent;
  let fixture: ComponentFixture<GraphNodeComponent>;
  let parentFixture: ComponentFixture<GraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphNodeComponent, GraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GraphNodeComponent);
    parentFixture = TestBed.createComponent(GraphComponent);

    const graph = new GraphObject('test graph')
    const node = new GraphNodeObject(new GraphNode('test node', null), graph)
    graph.addNode(node)
    parent = parentFixture.componentInstance
    parent.graph = graph
    component = fixture.componentInstance;
    component.parent = parent
    component.node = node
    component.initialPosition = { x: 0, y: 0 }

    spyOn(parent, 'autoLayout').and.callFake(() => {})
  });

  it('should create', () => {
    fixture.detectChanges();
    parentFixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
