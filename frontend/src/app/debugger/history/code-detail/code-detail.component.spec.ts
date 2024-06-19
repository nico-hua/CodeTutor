import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeDetailComponent } from './code-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';

describe('CodeDetailComponent', () => {
  let component: CodeDetailComponent;
  let fixture: ComponentFixture<CodeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeDetailComponent, HttpClientTestingModule, RouterModule.forRoot([])]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CodeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
