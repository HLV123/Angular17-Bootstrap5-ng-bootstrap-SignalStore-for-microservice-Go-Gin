import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'vnd', standalone: true })
export class VndPipe implements PipeTransform {
  transform(value: number | null | undefined, format: string = 'short'): string {
    if (value == null) return '—';
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    switch (format) {
      case 'billion': return sign + (abs / 1e9).toFixed(1) + ' tỷ';
      case 'million': return sign + (abs / 1e6).toFixed(1) + ' tr';
      case 'full': return sign + abs.toLocaleString('vi-VN');
      case 'short':
      default:
        if (abs >= 1e12) return sign + (abs / 1e12).toFixed(1) + ' nghìn tỷ';
        if (abs >= 1e9) return sign + (abs / 1e9).toFixed(1) + ' tỷ';
        if (abs >= 1e6) return sign + (abs / 1e6).toFixed(1) + ' tr';
        if (abs >= 1e3) return sign + (abs / 1e3).toFixed(1) + 'K';
        return sign + abs.toLocaleString('vi-VN');
    }
  }
}
