import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgorithmBaseComponent } from './algorithm-base.component';

describe('AlgorithmBaseComponent', () => {
  let component: AlgorithmBaseComponent;
  let fixture: ComponentFixture<AlgorithmBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlgorithmBaseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlgorithmBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
