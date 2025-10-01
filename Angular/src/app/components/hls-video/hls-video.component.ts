
import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import Hls from 'hls.js';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-hls-video',
  standalone: false,
  templateUrl: './hls-video.component.html',
  styleUrl: './hls-video.component.scss'
})

export class HlsVideoComponent implements OnDestroy {
  @ViewChild('video', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;

  hls?: Hls;
  src = environment.hlsStreamUrl;


  ngAfterViewInit(): void {
  const video = this.videoRef.nativeElement;
  video.muted = true;
  
  //Naloži in predvajaj mutiran video
  if (Hls.isSupported()) {
    this.hls = new Hls();
    this.hls.loadSource(this.src);
    this.hls.attachMedia(video);
    this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(console.warn);
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = this.src;
    video.addEventListener('loadedmetadata', () => {
      video.play().catch(console.warn);
    });
  }

  //Ko uporabnik klikne kjerkoli, odstrani muting in predvajaj z zvokom
  const unmuteOnInteraction = () => {
    video.muted = false;
    video.play().catch(console.warn);
    document.removeEventListener('click', unmuteOnInteraction);
  };
  
  document.addEventListener('click', unmuteOnInteraction);
}


  playVideo(): void {
    const video = this.videoRef.nativeElement;
    video.play()
      .catch(err => {
        console.warn('Neuspešno predvajanje videa:', err);
      });
  }

  ngOnDestroy(): void {
    if (this.hls) {
      this.hls.destroy();
    }
  }
}
