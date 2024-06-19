import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefComponent } from './ref.component';
import { RefObject } from '../../../../object/data-structure/ref';
import DataStructureObject from '../../../../object/data-structure/dataStructure';

describe('RefComponent', () => {
  let component: RefComponent;
  let fixture: ComponentFixture<RefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RefComponent);
    component = fixture.componentInstance;
    component.value = new RefObject('test ref', () => new DataStructureObject('test ref value', 'test'))
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
