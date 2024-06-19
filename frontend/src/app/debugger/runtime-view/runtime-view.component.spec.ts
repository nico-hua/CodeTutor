import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuntimeViewComponent } from './runtime-view.component';

describe('RuntimeViewComponent', () => {
  let component: RuntimeViewComponent;
  let fixture: ComponentFixture<RuntimeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuntimeViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RuntimeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
