import { Component, Input, OnInit } from '@angular/core';
import { PerformanceValues } from '../node-selection-performance/node-selection-performance.component';
import { PerformanceStats } from '../../variant-explorer/model';

@Component({
  selector: 'app-performance-table',
  templateUrl: './performance-table.component.html',
  styleUrls: ['./performance-table.component.scss'],
})
export class PerformanceTableComponent {
  @Input()
  performanceValues: PerformanceStats;

  @Input()
  heading: string;

  @Input()
  isExpanded = true;

  @Input()
  isBodyExpanded = false;

  constructor() {}
}
