import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from '../../truncate.pipe';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CodeService } from '../../../service/code.service'; 
import { Router } from '@angular/router';

export interface Record {
  id: number;
  user_id: number;
  code: string;
  url: string;
  submittedAt: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, TruncatePipe],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  records: Record[] = [];
  filteredRecords: Record[] = [];

  constructor(private recordService: CodeService, private router: Router) { }

  ngOnInit() {
    this.getRecords('all');
  }

  getRecords(filter: string) : void{
    switch (filter) {
      case 'all':
        this.recordService.getAllRecords().subscribe(records => {
          this.filteredRecords = records;
          this.records = records;
          console.log('All records:', records);
        });
        break;
      case 'week':
        this.recordService.getWeekRecords().subscribe(records => {
          
          this.filteredRecords = records;
          console.log('Week records:', records);
        });
        break;
        
      case 'month':
        this.recordService.getMonthRecords().subscribe(records => {
          
          this.filteredRecords = records;
          console.log('Month records:', records);
        });
        break;
    }
  }

  filterRecords(filter: string) {
    this.getRecords(filter);
  }

  clearHistory() {
    this.recordService.clearHistory().subscribe(() => {
      this.records = [];
    });
  }

  deleteRecord(id: number, filterSelect: HTMLSelectElement): void {
    this.recordService.deleteRecord(id).subscribe(records => {
      //this.records = this.records.filter(record => record.id !== id);
      console.log(records)
      this.filteredRecords = records;
      this.records = records
      filterSelect.value = 'all';
    });
  }

  onFilterChange(event: Event) {
    const filter = (event.target as HTMLSelectElement).value;
    this.getRecords(filter);
  }

  viewCodeDetail(id: number) {
    this.router.navigate(['/code-detail', id]);
  }
}