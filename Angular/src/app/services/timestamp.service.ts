import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimestampService {
  getFormattedTimestamp(): string {
    const now = new Date();
    const d = now.getDate().toString().padStart(2, '0');
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const y = now.getFullYear();
    const H = now.getHours().toString().padStart(2, '0');
    const M = now.getMinutes().toString().padStart(2, '0');
    const S = now.getSeconds().toString().padStart(2, '0');

    return `${d}/${m}/${y} ${H}:${M}:${S}`;
  }

formatDateString(dateStr: string, sec: number = 1): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);

  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  const H = date.getHours().toString().padStart(2, '0');
  const M = date.getMinutes().toString().padStart(2, '0');
  const S = date.getSeconds().toString().padStart(2, '0');

  if (sec === 1) {
    return `${d}/${m}/${y} ${H}:${M}:${S}`;
  } else {
    return `${d}.${m}.${y} ${H}:${M}`;
  }
}

}
