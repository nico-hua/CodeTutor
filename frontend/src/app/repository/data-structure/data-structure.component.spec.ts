import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataStructureComponent } from './data-structure.component';
import DataStructureObject from '../../../object/data-structure/dataStructure';

describe('DataStructureComponent', () => {
  let component: DataStructureComponent;
  let fixture: ComponentFixture<DataStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataStructureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DataStructureComponent);
    component = fixture.componentInstance;
    component.value = new DataStructureObject('test ds', 'test', 'test')
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
