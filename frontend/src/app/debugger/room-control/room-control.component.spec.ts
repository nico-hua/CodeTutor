import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomControlComponent } from './room-control.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RoomControlComponent', () => {
  let component: RoomControlComponent;
  let fixture: ComponentFixture<RoomControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomControlComponent, HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoomControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
