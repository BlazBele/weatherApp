import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-trend-indicator',
  standalone: false,
  templateUrl: './trend-indicator.component.html',
  styleUrl: './trend-indicator.component.scss'
})
export class TrendIndicatorComponent implements AfterViewInit, OnChanges {
  @Input() currentValue!: number;
  @Input() previousValue!: number;
  @Input() dailyMin: number = 0;
  @Input() dailyMax: number = 100;
  @Input() unit: string = '';
  @Input() size: number = 150;

  @ViewChild('mainPath') mainPath!: ElementRef<SVGPathElement>;

  circleX: number = 0;
  circleY: number = 0;

  get trend(): 'up' | 'down' | 'flat' {
    const diff = this.currentValue - this.previousValue;
    if (diff > 0.1) return 'up';
    if (diff < -0.1) return 'down';
    return 'flat';
  }

  ngAfterViewInit() {
    this.updateCirclePosition();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.mainPath) {
      this.updateCirclePosition();
    }
  }

  updateCirclePosition() {
    const pathEl = this.mainPath.nativeElement;
    const totalLength = pathEl.getTotalLength();

    let ratio = (this.currentValue - this.dailyMin) / (this.dailyMax - this.dailyMin);
    ratio = Math.min(Math.max(ratio, 0), 1);

    const point = pathEl.getPointAtLength(ratio * totalLength);

    this.circleX = point.x;
    this.circleY = point.y;
  }

}