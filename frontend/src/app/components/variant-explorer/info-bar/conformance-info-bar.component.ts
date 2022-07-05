import { Component, Input } from '@angular/core';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';

@Component({
  selector: 'app-conformance-info-bar',
  templateUrl: './conformance-info-bar.component.html',
  styleUrls: ['./conformance-info-bar.component.scss'],
})
export class ConformanceInfoBarComponent {
  @Input()
  numberFittingVariants: number;
  @Input()
  totalNumberVariants: number;
  @Input()
  numberFittingTraces: number;
  @Input()
  totalNumberTraces: number;
  @Input()
  isConformanceOutdated: boolean;
  @Input()
  numSelectedVariants: number;

  constructor(private sharedDataService: SharedDataService) {}
}
