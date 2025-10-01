import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-compass',
  standalone: false,
  templateUrl: './compass.component.html',
  styleUrl: './compass.component.scss'
})
export class CompassComponent implements OnChanges {
  @Input() direction: string = 'S';

  public angle = 0;
  public rotation = '';
  public reverseRotation: string[] = [];

  //Mapa za pretvorbo smeri v kote
  private directionAngles: Record<string, number> = {
    S: 0,
    SZ: 45,
    Z: 90,
    JZ: 135,
    J: 180,
    JV: 225,
    V: 270,
    SV: 315
  };

  ngOnChanges(changes: SimpleChanges): void {
    this.angle = this.directionAngles[this.direction] ?? 0;
    this.rotation = `rotate(${this.angle}, 87.5, 93.5)`;
    this.reverseRotation = [
      `rotate(${-this.angle}, 87.5, 3)`,
      `rotate(${-this.angle}, 87.5, 183)`,
      `rotate(${-this.angle}, 176, 94.5)`,
      `rotate(${-this.angle}, 0, 94.5)`
    ];
  }
}