import { Component , OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CodeService } from '../../../../service/code.service'; 



@Component({
  selector: 'app-code-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-detail.component.html',
  styleUrl: './code-detail.component.scss'
})



export class CodeDetailComponent implements OnInit {
  codeRecord: any;

  constructor(private route: ActivatedRoute, private recordService: CodeService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.recordService.getRecordById(+id).subscribe(response => {
        if (response.code === 200) {
          this.codeRecord = response.data;
        } else {
          console.error('Failed to fetch record:', response.errorMessage);
        }
      });
    }
  }
}