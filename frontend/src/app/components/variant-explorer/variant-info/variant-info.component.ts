import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { Variant } from '../model';

@Component({
  selector: 'app-variant-info',
  templateUrl: './variant-info.component.html',
  styleUrls: ['./variant-info.component.css'],
})
export class VariantInfoComponent implements OnInit {
  @Input()
  variant: Variant;

  @Input()
  selectable: boolean = true;

  @Output()
  public selectionChanged = new EventEmitter<boolean>();

  @Output()
  public updateConformance = new EventEmitter<Variant>();

  public processTreeIsPresent: boolean = false;

  constructor(private sharedDataService: SharedDataService) {}

  ngOnInit(): void {
    this.sharedDataService.currentDisplayedProcessTree$.subscribe((t) => {
      this.processTreeIsPresent = t !== undefined && t !== null;
    });
  }

  conformanceIconClicked(): void {
    if (this.isConformanceUpdatePossible()) {
      this.updateConformance.emit(this.variant);
    }
  }

  isConformanceUpdatePossible(): boolean {
    return (
      !this.variant.calculationInProgress &&
      (this.variant.isConformanceOutdated || this.variant.isTimeouted)
    );
  }
}
