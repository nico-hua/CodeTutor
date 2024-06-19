import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackItemComponent } from './stack-item.component';
import { LiteralVariable } from '../../../variable';

describe('StackItemComponent', () => {
  let component: StackItemComponent;
  let fixture: ComponentFixture<StackItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StackItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StackItemComponent);
    component = fixture.componentInstance;
    component.item = new LiteralVariable('test stack item', 'test', 'literal')
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
