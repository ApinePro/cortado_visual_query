import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Variant } from 'src/app/objects/Variants/variant';

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

  constructor(private processTreeService: ProcessTreeService) {}

  ngOnInit(): void {
    this.processTreeService.currentDisplayedProcessTree$.subscribe((t) => {
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
      (this.variant.isConformanceOutdated ||
        this.variant.isTimeouted ||
        this.variant.deviation === undefined)
    );
  }
}
