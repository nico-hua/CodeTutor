import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, limit: number): string {
    if (!value) return '';
    const lines = value.split('\n');
    return lines.slice(0, limit).join('\n');
  }
}
