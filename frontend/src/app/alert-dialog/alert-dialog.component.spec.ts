import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertDialogComponent } from './alert-dialog.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

class MatDialogRefMock {
  close() {}
  dismiss() {}
}

describe('AlertDialogComponent', () => {
  let component: AlertDialogComponent;
  let fixture: ComponentFixture<AlertDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertDialogComponent, CommonModule, MatDialogModule, MatButtonModule],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        // You also need to provide a mock for MAT_DIALOG_DATA if your component uses it
        { provide: MAT_DIALOG_DATA, useValue: { message: 'Test Message' } },
      ],
    }).compileComponents();
    
    fixture = TestBed.createComponent(AlertDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
