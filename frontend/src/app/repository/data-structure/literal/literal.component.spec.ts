import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiteralComponent } from './literal.component';
import { LiteralObject } from '../../../../object/data-structure/literal';

describe('LiteralComponent', () => {
  let component: LiteralComponent;
  let fixture: ComponentFixture<LiteralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiteralComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LiteralComponent);
    component = fixture.componentInstance;
    component.literal = new LiteralObject('test literal', 'literal')
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
