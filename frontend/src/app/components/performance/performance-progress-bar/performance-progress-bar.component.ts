import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-performance-progress-bar',
  templateUrl: './performance-progress-bar.component.html',
  styleUrls: ['./performance-progress-bar.component.css'],
})
export class PerformanceProgressBarComponent {
  nVariants: number = 0;

  @Input()
  public isVisible: boolean = false;

  @Input()
  public progress: number = 0;
}
