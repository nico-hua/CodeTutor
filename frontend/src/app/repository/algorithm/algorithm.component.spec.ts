import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgorithmComponent } from './algorithm.component';
import { AlgorithmObject } from '../../../object/algorithm/algorithm';

describe('AlgorithmComponent', () => {
  let component: AlgorithmComponent;
  let fixture: ComponentFixture<AlgorithmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlgorithmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlgorithmComponent);
    component = fixture.componentInstance;
    component.value = new AlgorithmObject('test alg', 'test', 'test')
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
