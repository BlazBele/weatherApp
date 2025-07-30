import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HlsVideoComponent } from './hls-video.component';

describe('HlsVideoComponent', () => {
  let component: HlsVideoComponent;
  let fixture: ComponentFixture<HlsVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HlsVideoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HlsVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
